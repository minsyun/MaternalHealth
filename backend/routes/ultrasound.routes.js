import express from "express";
import db from "../db/connection.js";

const router = express.Router();

router.get("/ultrasound/latest", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const week = parseInt(req.query.checkup_wks);

    let query;
    let params;

    if (!isNaN(week)) {
      query = `
        SELECT checkup_wks, file_path, upload_date
        FROM ultrasound_record
        WHERE personal_informations_user_id = ?
        ORDER BY ABS(checkup_wks - ?) ASC
        LIMIT 1
      `;
      params = [userId, week];
    } else {
      query = `
        SELECT file_path
        FROM ultrasound_record
        WHERE personal_informations_user_id = ?
        ORDER BY checkup_wks DESC
        LIMIT 1
      `;
      params = [userId];
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      return res.json({
        hasUltrasound: true,
        img: rows[0].file_path,
      });
    }

    res.json({ hasUltrasound: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "取得超音波失敗" });
  }
});

export default router;