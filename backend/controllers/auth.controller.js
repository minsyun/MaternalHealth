import db from '../db/connection.js';
import jwt from "jsonwebtoken";
import {sendOtpEmail} from "../services/mail.service.js";

// 暫存 OTP（正式專案建議用 Redis）
const otpStore = {};

/**
 * 第一步：確認身分 + 產生 OTP
 */
export const requestOtp = async (req, res) => {
  try {
    const { national_id, phone_number } = req.body;

    if (!national_id || !phone_number) {
      return res.status(400).json({
        success: false,
        message: '請輸入身分證字號與手機號碼',
      });
    }

    const idRegex = /^[A-Z][12]\d{8}$/;
    if (!idRegex.test(national_id)) {
      return res.status(400).json({
        success: false,
        message: '身分證格式錯誤',
      });
    }

    // 查詢使用者
    const [rows] = await db.query(
      `SELECT user_id, name, national_id, phone_number, email
      FROM personal_information 
      WHERE national_id = ? AND phone_number = ?`,
      [national_id, phone_number]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND', 
        message: '身分證字號或手機號碼錯誤',
      });
    }
    
    const user = rows[0];

    const existing = otpStore[user.user_id];

    if (existing && Date.now() < existing.cooldown) {
      const remaining = Math.ceil((existing.cooldown - Date.now()) / 1000);

      return res.status(429).json({
        success: false,
        message: `請 ${remaining} 秒後再試`,
        remaining
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "此帳號尚未綁定 Email",
      });
    }

    // 產生 6 位 OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 存入暫存（5分鐘有效）
    otpStore[user.user_id] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 分鐘後過期
      cooldown: Date.now() + 60 * 1000, // 同一個使用者
      attempts: 0
    };
    
    // 寄送 OTP 到使用者 Email
    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error("Email 發送錯誤:", mailErr);
    } 

    // 回傳成功訊息（不包含 OTP）
    return res.json({
      success: true,
      message: "OTP 已寄送到 Email",
      user_id: user.user_id,
    });

    

  } catch (err) {
    console.error(err);
    return res.status(500).json({
    success: false,
    message: "Email 發送失敗，請洽醫護人員協助。",
  });
  }
};


/**
 * 第二步：驗證 OTP + 正式登入
 */
export const verifyOtp = async (req, res) => {
  try {
    const { user_id, otp } = req.body;

    console.log("收到驗證:", user_id, otp);
    console.log("目前儲存:", otpStore[user_id]);


    if (!user_id || !otp) {
      return res.status(400).json({
        success: false,
        message: '缺少驗證資料',
      });
    }

    const record = otpStore[user_id];

    if (!record) {
      return res.status(400).json({
        success: false,
        message: '請先請求驗證碼',
      });
    }

    if (Date.now() > record.expires) {
      delete otpStore[user_id];
      return res.status(400).json({
        success: false,
        message: '驗證碼已過期',
      });
    }

    if (record.attempts >= 5) {
      delete otpStore[user_id];
      return res.status(429).json({
        success: false,
        message: "驗證次數過多，請重新取得驗證碼"
      });
    }

    if (record.otp !== otp) {
      record.attempts++;
      return res.status(400).json({
        success: false,
        message: "驗證碼錯誤"
      });
    }

    // 驗證成功，刪除OTP
    delete otpStore[user_id];

    // 撈使用者資料
    const [rows] = await db.query(
      `SELECT user_id, name, national_id, phone_number, email
      FROM personal_information 
      WHERE user_id = ?`,
      [user_id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "使用者不存在",
      });
    }

    // 產生 JWT（關鍵步驟）
    const token = jwt.sign(
      { user_id: user.user_id },   
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "登入成功",
      token,     // 回傳 token
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤',
    });
  }
};