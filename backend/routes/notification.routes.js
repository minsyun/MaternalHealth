import express from "express";
import db from "../db/connection.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {

  const { userId } = req.params;
  const clientWeek = req.query.week;

  console.log(`User: ${userId}, Received Week: ${clientWeek}`); // 確認收到的 userId 和 week

  try {

    const notifications = [];

    /* 1️⃣ 14天內產檢提醒 */

    const [events] = await db.query(`
      SELECT 
        event_id,
        event_title,
        event_type,
        event_start_date,
        event_describe,
        DATEDIFF(event_start_date, CURDATE()) AS days_left
      FROM schedule
      WHERE personal_informations_user_id = ?
      AND event_start_date >= CURDATE()
      AND DATEDIFF(event_start_date, CURDATE()) <= 14
      ORDER BY event_start_date
    `, [userId]);

    events.forEach(e => {

      let message = "";
      if (e.event_describe) {
        message += ` ${e.event_describe}` ;
      }

      // 特別提示今天的行程
      if (e.days_left === 0) {
        message = `今天有行程：「${e.event_title}」`;
      }

      notifications.push({
        id: e.event_id,
        type: "checkup",
        title: e.event_title,
        date: e.event_start_date,
        message: message
      });
    });


    /* 2️⃣ 取得孕週 */

    let currentWeek = Number(clientWeek);

    if (currentWeek === undefined || currentWeek === null || isNaN(currentWeek)) {

      const [user] = await db.query(`
        SELECT LMP
        FROM personal_information
        WHERE user_id = ?
      `, [userId]);

      if (user[0]?.LMP) {

        const lmp = new Date(user[0].LMP);
        const today = new Date();
        const diffDays = Math.floor((today - lmp) / (1000 * 60 * 60 * 24));
        currentWeek = Math.floor(diffDays / 7);

      }

    }

    if (currentWeek === null || currentWeek === undefined || isNaN(currentWeek)) {
      return res.json(notifications);
    }



  /* 取得衛教提醒 (優先取未讀，全讀完則取複習) */

  // 先抓出「當前週數以前(含)」所有還沒讀過的文章
  const [unreadEducation] = await db.query(`
    SELECT 
      hp.he_pregnancy_id,
      hp.title_hepregnancy,
      hp.link_hepregnancy,
      hp.he_pregnancy_min_week
    FROM he_pregnancy hp
    WHERE hp.he_pregnancy_min_week <= ? 
      AND hp.he_pregnancy_id NOT IN (
        SELECT he_pregnancy_id 
        FROM read_records 
        WHERE personal_informations_user_id = ?
      )
    ORDER BY hp.he_pregnancy_min_week ASC
  `, [currentWeek, userId]);

  if (unreadEducation.length > 0) {
    // 還有文章沒讀就推播這些未讀文章
    unreadEducation.forEach(e => {
      notifications.push({
        type: "education",
        article_id: e.he_pregnancy_id,
        title: e.title_hepregnancy,
        link: e.link_hepregnancy,
        message: `第 ${e.he_pregnancy_min_week} 週：尚未閱讀「${e.title_hepregnancy}」`
      });
    });
  } else {
    // 全部都讀過的話根據目前週數，推薦「同階段」的內容進行複習
    const [reviewArticles] = await db.query(`
      SELECT 
        hp.he_pregnancy_id,
        hp.title_hepregnancy,
        hp.link_hepregnancy,
        hp.he_pregnancy_min_week
      FROM read_records rr
      JOIN he_pregnancy hp ON rr.he_pregnancy_id = hp.he_pregnancy_id
      WHERE rr.personal_informations_user_id = ?
        AND hp.he_pregnancy_min_week <= ?
        AND hp.he_pregnancy_min_week > ?
      ORDER BY RAND()
      LIMIT 3
    `, [userId, currentWeek, currentWeek - 4]); // 推薦最近 4 週內的內容複習
    console.log("Unread Count:", unreadEducation.length);

    if (reviewArticles.length > 0) {
      reviewArticles.forEach(e => {
        notifications.push({
          type: "review", 
          article_id: e.he_pregnancy_id,
          title: e.title_hepregnancy,
          link: e.link_hepregnancy,
          message: `您已完成本階段衛教！建議複習：第 ${e.he_pregnancy_min_week} 週內容`
        });
      });
    } else {
      // 如果連最近4週都沒有，就隨機抓3則已讀的
      const [fallbackReview] = await db.query(`
        SELECT hp.he_pregnancy_id, hp.title_hepregnancy, hp.link_hepregnancy
        FROM read_records rr
        JOIN he_pregnancy hp ON rr.he_pregnancy_id = hp.he_pregnancy_id
        WHERE rr.personal_informations_user_id = ?
        ORDER BY RAND() LIMIT 3
      `, [userId]);

      fallbackReview.forEach(e => {
          notifications.push({
            type: "review",
            article_id: e.he_pregnancy_id,
            title: e.title_hepregnancy,
            link: e.link_hepregnancy,
            message: "回顧精彩內容 🎉"
          });
      });
    }
  }
      

      res.json(notifications);

    } catch (error) {

      console.error(error);
      res.status(500).json({ error: "通知取得失敗" });

    }

  });

  export default router;