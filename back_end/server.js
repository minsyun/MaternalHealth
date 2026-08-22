import dotenv from 'dotenv';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import mysql from 'mysql2/promise';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import  authMiddleware from "./middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const upload = multer({ dest: 'temp/' });

app.use(cors({
  origin: function (origin, callback) {
    // 允許沒有 origin 的請求 (例如行動裝置 App 或 Postman)
    if (!origin) return callback(null, true);
    
    // 定義允許的清單
    const allowedOrigins = [
      // 'http://localhost:5173',
      // 'http://127.0.0.1:5173',
      'http://192.168.100.6:5173' // 手機目前連線的網址
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // 如果你有用到 Cookie 或 Auth Header，這行很重要
}));
app.use(express.json());

// Cloudinary 配置 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// 啟動時檢查
console.log('--- Cloudinary 連接檢查 ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key 長度:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : '未讀取');

// 測試連接配置
cloudinary.api.ping()
  .then(result => console.log('Cloudinary 連接狀態:', result.status)) 
  .catch(err => console.error('Cloudinary 連接失敗:', err.message));

// 資料庫連線設定
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API 路由 

// 取得特定使用者的行程
app.get('/api/schedule',authMiddleware, async (req, res) => {
    const userId = req.user.user_id; 
    try {
        const [events] = await db.query(
            "SELECT * FROM schedule WHERE personal_informations_user_id = ?", 
            [userId]
        );
        const [diaries] = await db.query(
            "SELECT * FROM diary WHERE personal_informations_user_id = ?", 
            [userId]
        );
        res.json({
            dbEvents: events,
            dbDiaries: diaries
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 新增行程 
app.post('/api/schedule', authMiddleware , async (req, res) => {
    const data = req.body;
    const userId = req.user.user_id;

    if (!data.personal_informations_user_id) {
        return res.status(400).json({ success: false, message: "缺少使用者 ID" });
    }
    try {
        // 取得最後一個 ID 並 +1
        const [rows] = await db.query("SELECT event_id FROM schedule ORDER BY event_id DESC LIMIT 1");
        let nextId = "E001";
        if (rows.length > 0) {
            const lastId = rows[0].event_id;
            const lastNumber = parseInt(lastId.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;

            if (nextNumber < 1000) {
                nextId = `E${nextNumber.toString().padStart(3, '0')}`;
            } else {
                nextId = `E${nextNumber}`;
            }
        }

        const sql = `INSERT INTO schedule (
            event_id, 
            personal_informations_user_id, 
            event_title, 
            event_type, 
            event_start_date,
            event_end_date, 
            event_start_time, 
            event_end_time, 
            event_place, 
            event_describe, 
            event_created_datetime, 
            event_is_auto, 
            event_is_editable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  NOW(), ?, ?)`;

        await db.query(sql, [
            nextId, 
            userId, 
            data.event_title, 
            data.event_type, 
            data.event_start_date, 
            data.event_end_date, 
            data.event_start_time, 
            data.event_end_time, 
            data.event_place, 
            data.event_describe, 
            0, // event_is_auto (手動新增為 0)
            1  // event_is_editable
        ]);

        res.json({ success: true, eventId: nextId });
    } catch (err) {
        console.error("後端新增錯誤:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 刪除行程
app.delete('/api/schedule/:eventId', authMiddleware , async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.user_id;
    try {
        const [result] = await db.query(
            "DELETE FROM schedule WHERE event_id = ?", 
            [eventId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "找不到該行程，無法刪除" });
        }

        res.json({ success: true, message: "行程已成功刪除" });
    } catch (err) {
        console.error("刪除 SQL 錯誤:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 編輯行程
app.put('/api/schedule/:eventId', authMiddleware , async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.user_id;
    const data = req.body;

    const sql = `UPDATE schedule SET 
        event_title=?, 
        event_type=?, 
        event_start_date=?, 
        event_end_date=?,
        event_start_time=?, 
        event_end_time=?, 
        event_place=?, 
        event_describe=? ,
        event_modified_datetime = NOW() 
        WHERE event_id=?`;
    try {
        await db.query(sql, [
            data.event_title, data.event_type, data.event_start_date, 
            data.event_end_date,data.event_start_time, data.event_end_time, data.event_place, 
            data.event_describe, eventId, userId
        ]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 新增日記
app.post('/api/diary', authMiddleware , upload.single('image'), async (req, res) => {
    const { title, date, content } = req.body;
    const userId = req.user.user_id;
    let imageUrl = ''; 

    // if (!personal_informations_user_id) {
    //     return res.status(400).json({ success: false, message: '使用者 ID 為必填項目' });
    // }

    try {
        if (!date) {
            return res.status(400).json({ success: false, message: '日期為必填項目' });
        }
        
        // 檢查是否「文字」與「圖片」皆為空
        if (!content && !req.file) {
            return res.status(400).json({ success: false, message: '文字內容或圖片必須擇一填寫' });
        }

        // 計算下一個 ID
        const [rows] = await db.query(
            "SELECT diary_id FROM diary ORDER BY LENGTH(diary_id) DESC, diary_id DESC LIMIT 1"
        );

        let diaryId = "D001"; // 預設第一筆
        if (rows.length > 0) {
            const lastId = rows[0].diary_id;
            const lastNumber = parseInt(lastId.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            
            diaryId = nextNumber < 1000 
                ? `D${nextNumber.toString().padStart(3, '0')}` 
                : `D${nextNumber}`;
        }

        // 圖片處理 (只有在有檔案時才執行) 
        if (req.file) {
            console.log('偵測到圖片檔案，準備上傳至 Cloudinary...');
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: '專題/日記'
            });
            imageUrl = result.secure_url;
            
            // 刪除本機 temp 暫存檔
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }

        // 執行資料庫寫入
        const sql = `INSERT INTO diary (
            diary_id, diary_title, diary_date, diary_description, 
            diary_file_path, personal_informations_user_id, diary_created_datetime
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`;

        await db.query(sql, [
            diaryId,
            title || '今日日記', // 標題預設值
            date,
            content || '',
            imageUrl, // 有圖就是網址，沒圖就是空字串
            userId
        ]);

        res.json({ success: true, message: '日記儲存成功' });

    } catch (err) {
        // 發生錯誤時清理暫存檔
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('後端詳細錯誤:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 編輯日記
app.put('/api/diary/:diaryId', authMiddleware , upload.single('image') , async (req, res) => {
    const diaryId = req.params.diaryId;
    const userId = req.user.user_id;
    const { title, date, content, image } = req.body;
    let imageUrl = image || ''; // 前端傳回來的原圖網址 (如果沒有傳新檔案)

    try {
        // 圖片處理：如果有上傳新檔案 ---
        if (req.file) {
            console.log('編輯中：偵測到新圖片，正在更換...');
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: '專題/日記'
            });
            imageUrl = result.secure_url; // 使用新圖片網址

            // 刪除 temp 暫存
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }

        if (!content && !imageUrl) {
            return res.status(400).json({ success: false, message: '文字或圖片需擇一存在' });
        }

        // 更新資料庫 
        const sql = `UPDATE diary SET 
            diary_title = ?, 
            diary_date = ?, 
            diary_description = ?, 
            diary_file_path = ?,
            diary_modified_datetime = NOW() 
            WHERE diary_id = ?`;

        await db.query(sql, [
            title || '今日日記',
            date,
            content || '',
            imageUrl, // 可能是舊網址或新網址
            diaryId,
            userId
        ]);

        res.json({ success: true, message: '日記更新成功', imageUrl });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('更新失敗:', err);
        res.status(500).json({ error: err.message });
    }
});

// 刪除日記
app.delete('/api/diary/:diaryId', authMiddleware , async (req, res) => {
    const diaryId = req.params.diaryId; 
    const userId = req.user.user_id;
    
    try {
        const [result] = await db.query(
            "DELETE FROM diary WHERE diary_id = ?", 
            [diaryId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "找不到該日記，無法刪除" });
        }

        res.json({ success: true, message: "日記已成功刪除" });
    } catch (err) {
        console.error("刪除日記 SQL 錯誤:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3001, () => {
    console.log('🚀 橋樑已搭建！後端伺服器運行在 http://192.168.100.6:3001');
});