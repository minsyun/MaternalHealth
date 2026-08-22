import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/connection.js';
import { v2 as cloudinary } from 'cloudinary';
import  verifyToken from "./middleware/verifyToken.js";
import authRoutes from './routes/auth.routes.js';

dotenv.config();
// Cloudinary 配置
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

app.use(cors({
  // origin: ['http://localhost:5173','http://127.0.0.1:5173',
  //   'http://192.168.0.187:5173'],
  origin:'http://192.168.100.6:5173',
  credentials: true
}));
app.use(express.json({limit: '10mb' })); // 增加 JSON 請求的大小限制
app.use(express.urlencoded({limit: '10mb', extended: true }));

//API 路由
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.listen(3002,'0.0.0.0', () => {
  console.log('API running at http://192.168.100.6:3002');
});

app.get("/api/profile", verifyToken,async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM personal_information WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "查無資料" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("SQL 查詢失敗原因:", err); // 這行非常重要！會在後端終端機印出詳細原因
    res.status(500).json({ message: "伺服器錯誤", error: err.message }); // 暫時把錯誤傳回前端看
  }
});

// 更新個人資料的 API
app.put("/api/profile/:user_id", verifyToken, async (req, res) => {
  const { user_id } = req.params;
  const data = req.body;

  let imageUrl = data.user_file_path || null;

  try {
    // 檢查是否有新的圖片 (如果是 Base64 字串，代表是新上傳的)
    if (data.avatar && data.avatar.startsWith('data:image')) {
      console.log("偵測到新圖片，準備上傳 Cloudinary...");
      try {
        const uploadResponse = await cloudinary.uploader.upload(data.avatar, {
          upload_preset: 'ml_default',
          folder: '專題/頭像', 
          // 使用user_id固定檔名，覆蓋原先舊的頭像檔案
          public_id: `user_${user_id}`, 
          overwrite: true,
          invalidate: true // 確保CDN緩存會更新，否則舊照片可能還會出現一陣子
        });
        imageUrl = uploadResponse.secure_url;
        console.log("Cloudinary 上傳成功:", imageUrl);
      } catch (error) {
        console.error("Cloudinary 上傳失敗:", error);
        return res.status(500).json({ success: false, message: "圖片上傳失敗" });
      }
    }

    const query = `
      UPDATE personal_information 
      SET 
        name = ?, 
        birthday = ?, 
        phone_number = ?, 
        landline = ?, 
        email = ?, 
        address = ?, 
        ice_name = ?, 
        ice_relationship = ?, 
        ice_phone_number = ?, 
        blood_type = ?, 
        height = ?, 
        weight = ?,
        user_file_path = ?
      WHERE user_id = ?
    `;

    const values = [
      data.name || null,
      (data.birthday && data.birthday.trim() !== "") ? data.birthday : null,
      data.phone_number || null,
      data.landline || null,
      data.email || null,
      data.address || null,
      data.ice_name || null,
      data.ice_relationship || null,
      data.ice_phone_number || null,
      data.blood_type || null,
      data.height || 0,
      data.weight || 0,
      imageUrl,
      user_id
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "找不到該使用者或資料未變更" });
    }

    res.json({ success: true, message: "資料與圖片同步成功", imageUrl });
  } catch (err) {
    console.error("更新失敗:", err);
    res.status(500).json({ success: false, message: "伺服器更新錯誤", error: err.message });
  }
});

// 引入並使用產檢資料的路由
import prenatalRoutes from "./routes/prenatal.routes.js";
app.use("/api/prenatal", verifyToken, prenatalRoutes);

// 引入並使用寶寶水果示意圖的路由
import growthRoutes from "./routes/growth.routes.js";
app.use("/api/growth", verifyToken, growthRoutes);

// 引入並使用通知的路由
import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/notifications", verifyToken, notificationRoutes);

// 引入並使用上傳圖片的路由
import uploadRoutes from "./routes/upload.routes.js";
app.use("/api", uploadRoutes);

// 引入並使用超音波列表的路由
import ultrasoundTimelineRoutes from "./routes/ultrasoundTimeline.routes.js";
app.use("/api",verifyToken, ultrasoundTimelineRoutes);

// 引入並使用最新超音波的路由
import ultrasoundRoutes from "./routes/ultrasound.routes.js";
app.use("/api",verifyToken, ultrasoundRoutes);