import express from "express";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.post("/upload-avatar", async (req, res) => {
  try {
    // 1. 修正變數名稱，從 req.body 拿取 'image'
    const { image, user_id } = req.body; 

    if (!image) {
      return res.status(400).json({ error: "未接收到圖片數據" });
    }

    // 2. 上傳到 Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "專題/頭像",
      public_id: user_id ? `${user_id}` : undefined,
      overwrite: true,
      invalidate: true
    });

    // 3. 回傳 'imageUrl' (完整網址)，前端 handleFileUpload 才能正確接收
    res.json({
      success: true,
      imageUrl: result.secure_url, 
      public_id: result.public_id
    });

  } catch (err) {
    console.error("Cloudinary 上傳詳細錯誤:", err);
    res.status(500).json({ error: "上傳失敗", detail: err.message });
  }
});

export default router;