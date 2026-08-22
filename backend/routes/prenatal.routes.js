import express from "express";
import db from "../db/connection.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// 取得登入使用者的產檢資料
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id; // 從 JWT 解出 user id
    console.log("後端正在為此 ID 查詢資料:", userId);

    const [rows] = await db.query(
    `SELECT 
        prenatal_checkup_id,
        personal_informations_user_id,
        DATE_FORMAT(visit_date, '%Y-%m-%d') AS visit_date, 
        gestational_age_wks,
        gestational_age_days,
        gravida, para, SA, AA,
        DATE_FORMAT(LMP, '%Y-%m-%d') AS LMP,             
        DATE_FORMAT(PMP, '%Y-%m-%d') AS PMP,             
        married_status, body_weight, blood_pressure_sys,
        blood_pressure_dia, body_height, bmi,
        pre_pregnancy_weight, pre_pregnancy_bmi,
        urine_sugar, urine_protein, insemination,
        cohabitants_smoke, cohabitants_smoke_relationship
    FROM prenatal_checkup 
    WHERE personal_informations_user_id = ?
    AND visit_date <= CURDATE()
    ORDER BY visit_date DESC`,
    [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "取得產檢資料失敗" });
  }
});

export default router;