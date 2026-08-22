//讀growth_diagram中的資料，根據week參數回傳對應的資料

import express from "express";
import db from "../db/connection.js";

const router = express.Router();

router.get("/:week", async (req, res) => {
  try {
    const week = req.params.week;

    const [rows] = await db.execute(
      "SELECT * FROM growth_diagram WHERE growth_week = ?",
      [week]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "找不到資料" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

export default router;