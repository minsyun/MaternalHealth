import express from "express";
import db from "../db/connection.js";

const router = express.Router();

router.get("/ultrasound/all", async (req, res) => {
  try {
    const userId = req.user.user_id;

    // 加入日期判斷，只抓取小於等於今天（CURRENT_DATE）的紀錄
    const [rows] = await db.query(
      `SELECT checkup_wks, file_path, upload_date
       FROM ultrasound_record
       WHERE personal_informations_user_id = ? 
       AND upload_date <= CURRENT_DATE
       ORDER BY checkup_wks ASC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "取得超音波列表失敗" });
  }
});

export default router;