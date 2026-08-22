import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';

import db from './db.js'; 
import authMiddleware from './middleware/auth.js'


const app = express();

// 啟用 CORS 與 JSON 解析
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


// [GET] 獲取使用者個人詳細資料 (用於產前照護和愛丁堡表單自動代入、衛教資訊專區的目前懷孕週數)
app.get("/api/personal_information/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    // 撰寫 SQL 語法：一次抓取所有基本資料欄位
    // 欄位名稱對應資料表：name, national_id, birthday, phone_number, landline, address, edc
    const sql = `
      SELECT  DATE_FORMAT(lmp, '%Y-%m-%d') AS lmp, name, national_id, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, phone_number, landline, address, DATE_FORMAT(edc, '%Y-%m-%d') AS edc
      FROM personal_information 
      WHERE user_id = ?
    `;
    const [rows] = await db.query(sql, [user_id]);

    // 檢查是否有這筆資料
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "找不到該使用者的資料" });
    }

    // 回傳完整的個人資訊物件
    res.json({
      success: true,
      data: {
        lmpDate: rows[0].lmp,            // 最後一次月經
        userName: rows[0].name,          // 姓名
        idNumber: rows[0].national_id,   // 身分證字號
        birthday: rows[0].birthday,      // 出生日期
        phone: rows[0].phone_number,     // 手機號碼
        homePhone: rows[0].landline,     // 住家電話
        address: rows[0].address,        // 聯絡地址
        dueDate: rows[0].edc             // 預產期
      }
    });

  } catch (error) {
    console.error("獲取產前基本資料錯誤：", error);
    res.status(500).json({ success: false, message: "伺服器讀取錯誤" });
  }
});


//  獲取使用者的已讀文章列表 (GET)
app.get("/api/read_records", authMiddleware, async (req, res) => {
  // 從網址列取得 user_id (例如 ?user_id=U001)
  const userId = req.query.user_id; 

  try {
    const [rows] = await db.query(
      "SELECT he_pregnancy_id FROM read_records WHERE personal_informations_user_id = ?", 
      [userId]
    );
    
    // 把撈出來的物件陣列轉成單純的字串陣列 ["PG001", "PG002"]
    const readIds = rows.map(row => row.he_pregnancy_id);
    res.json(readIds);

  } catch (error) {
    console.error("查詢已讀紀錄錯誤：", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// 新增一筆已讀紀錄 (POST)
app.post("/api/read_records", authMiddleware, async (req, res) => {
  // 接收前端送來的 JSON body 資料
  const { user_id, article_id } = req.body;

  try {
    // 在資料庫尋找目前最大的「RR號碼」
    // 用 SUBSTRING 把 'RR' 截掉，轉成數字後由大到小排序，只抓第一筆 (最大值)
    const [rows] = await db.query(
      "SELECT read_records_id FROM read_records ORDER BY CAST(SUBSTRING(read_records_id, 3) AS UNSIGNED) DESC LIMIT 1"
    );

    let newRecordId = "RR001"; // 預設值：如果資料表是空的，就從 RR001 開始

    if (rows.length > 0) {
      // 抓出最大的 ID，例如 "RR013"
      const lastId = rows[0].read_records_id; 
      
      // 把 "RR" 截掉，把剩下的字串轉成純數字，然後 + 1
      const nextNumber = parseInt(lastId.replace("RR", "")) + 1; 

      // 把數字轉成字串，如果長度不到 3，就在前面補 '0'
      const paddedNumber = String(nextNumber).padStart(3, '0');
      
      // 組合出新的 ID，例如 "RR014"
      newRecordId = `RR${paddedNumber}`; 
    }

    // 把算好的新 ID 和資料一起寫入資料庫
    await db.query(
      "INSERT IGNORE INTO read_records(read_records_id, personal_informations_user_id, he_pregnancy_id) VALUES (?, ?, ?)", 
      [newRecordId,user_id, article_id]
    );
    
    res.json({ success: true, message: `已成功寫入已讀紀錄，流水號為：${newRecordId}` });

  } catch (error) {
    console.error("寫入已讀紀錄錯誤：", error);
    res.status(500).json({ message: "寫入資料庫失敗" });
  }
});



// 獲取使用者的評估歷史紀錄 (GET)
app.get("/api/assessment_history", authMiddleware, async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ message: "缺少 user_id 參數" });
  }

  try {
    // 使用 JOIN 同時抓取歷史紀錄與問卷名稱
    const sql = `
      SELECT 
        h.assessment_response_id, 
        DATE_FORMAT(h.assessment_submit_datetime, '%Y-%m-%d %H:%i:%s') AS assessment_submit_datetime, 
        t.questionnaire_title, 
        t.questionnaire_sort
      FROM assessment_history h
      JOIN questionnaire_type t ON h.questionnaire_type_questionnaire_type_id = t.questionnaire_type_id
      WHERE h.personal_informations_user_id = ?
      ORDER BY h.assessment_submit_datetime DESC
    `;

    const [rows] = await db.query(sql, [userId]);
    
    res.json(rows);

  } catch (error) {
    console.error("查詢評估歷史錯誤：", error);
    res.status(500).json({ message: "伺服器讀取歷史紀錄失敗" });
  }
});



// 獲取愛丁堡量表的詳細內容 (GET) 
app.get("/api/edinburgh_detail/:response_id", authMiddleware, async (req, res) => {
  const { response_id } = req.params;

  try {
    // 1. 抓取基本資訊與總分建議(Join assessment_history 與 edinburgh_history_detail)
    // 重點：使用 DATE_FORMAT 將日期與時間轉為特定格式的字串
    const [detailRows] = await db.query(`
      SELECT 
        h.assessment_response_id,
        DATE_FORMAT(h.assessment_submit_datetime, '%Y-%m-%d %H:%i:%s') AS assessment_submit_datetime,
        d.edinburgh_detail_id,
        d.total_score,
        d.advice_message,
        d.edinburgh_identity_role,
        DATE_FORMAT(d.edinburgh_edc, '%Y-%m-%d') AS edinburgh_edc
      FROM assessment_history h
      JOIN edinburgh_history_detail d ON h.assessment_response_id = d.assessment_history_assessment_response_id
      WHERE h.assessment_response_id = ?
    `, [response_id]);

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "找不到該筆詳細紀錄" });
    }

    const detail = detailRows[0];

    // 2. 根據詳細表的 ID 抓取所有的題目答案
    const [answerRows] = await db.query(`
      SELECT 
        edinburgh_question_key as question_num,
        selected_value as score,
        selected_text as answer_text
      FROM edinburgh_history_answering
      WHERE edinburgh_history_detail_edinburgh_detail_id = ?
      ORDER BY CAST(edinburgh_question_key AS UNSIGNED) ASC
    `, [detail.edinburgh_detail_id]);

    // 3. 組合資料格式回傳
    res.json({
      summary: {
        response_id: detail.assessment_response_id,
        submit_time: detail.assessment_submit_datetime, // YYYY-MM-DD HH:mm:ss 字串
        total_score: detail.total_score,
        advice: detail.advice_message,
        role: detail.edinburgh_identity_role === 1 ? '準媽媽' : '寶寶媽媽',
        edc: detail.edinburgh_edc // YYYY-MM-DD 字串
      },
      answers: answerRows
    });

  } catch (error) {
    console.error("讀取詳細紀錄失敗：", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});



// 獲取產前健康照護表單的詳細內容 (GET)
app.get("/api/prenatal_detail/:response_id", authMiddleware, async (req, res) => {
  const { response_id } = req.params;

  try {
    // 1. 抓取基本資料與健康行為 (Join assessment_history 與 antepartum_history_detail)
    const [detailRows] = await db.query(`
      SELECT 
        h.assessment_response_id,
        DATE_FORMAT(h.assessment_submit_datetime, '%Y-%m-%d %H:%i:%s') AS assessment_submit_datetime,
        d.antepartum_detail_id,
        d.antepartum_name, d.antepartum_national_id, 
        DATE_FORMAT(d.antepartum_birthday, '%Y-%m-%d') AS antepartum_birthday,
        d.antepartum_phone_number, d.antepartum_homephone, d.antepartum_address,
        d.smoke_habit, d.secondhand_smoke_environment, d.drinking_habit, 
        d.betelnut_habit, d.drug_usage, d.depression_test1, d.depression_test2,
        d.medical_history as has_medical_history
      FROM assessment_history h
      JOIN antepartum_history_detail d ON h.assessment_response_id = d.assessment_history_assessment_response_id
      WHERE h.assessment_response_id = ?
    `, [response_id]);

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "找不到該筆產前評估紀錄" });
    }

    const detail = detailRows[0];
    const detailId = detail.antepartum_detail_id;

    // 2. 抓取醫療病史 (從 antepartum_medical_history)
    const [medicalRows] = await db.query(`
      SELECT disease_code, disease_note 
      FROM \`antepartum_medical_history\` 
      WHERE antepartum_history_detail_antepartum_detail_id = ?
    `, [detailId]);

    // 3. 抓取衛教指導回答 (從 antepartum_health_education)
    const [eduRows] = await db.query(`
      SELECT question_index, question_answer 
      FROM antepartum_health_education 
      WHERE antepartum_history_detail_antepartum_detail_id = ?
      ORDER BY CAST(question_index AS UNSIGNED) ASC
    `, [detailId]);

    // 4. 組合 JSON 回傳給前端
    res.json({
      summary: {
        response_id: detail.assessment_response_id,
        submit_time: detail.assessment_submit_datetime,
        name: detail.antepartum_name,
        idNumber: detail.antepartum_national_id,
        birthDate: detail.antepartum_birthday,
        phone: detail.antepartum_phone_number,
        homePhone: detail.antepartum_homephone,
        address: detail.antepartum_address
      },
      behavior: {
        smoking: detail.smoke_habit,
        secondhandSmoke: detail.secondhand_smoke_environment,
        drinking: detail.drinking_habit,
        betelNut: detail.betelnut_habit,
        drugs: detail.drug_usage,
        depression1: detail.depression_test1,
        depression2: detail.depression_test2
      },
      medicalHistory: {
        hasHistory: detail.has_medical_history === 1,
        selectedItems: medicalRows.map(m => m.disease_code),
        otherNote: medicalRows.find(m => m.disease_code === '11')?.disease_note || ""
      },
      education: eduRows.map(e => ({
        index: e.question_index,
        value: e.question_answer
      }))
    });

  } catch (error) {
    console.error("讀取產前詳細紀錄失敗：", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});



// 提交愛丁堡量表 (POST)
app.post("/api/submit_edinburgh", authMiddleware, async (req, res) => {
  const { user_id, form, questions, totalScore, message } = req.body;
  const connection = await db.getConnection(); // 取得連線以使用 Transaction

  try {
    await connection.beginTransaction(); // 開始事務

    // --- 步驟 A: 生成流水號 (輔助函式見下方) ---
    const nextAR = await getNextId(connection, 'assessment_history', 'assessment_response_id', 'AR');
    const nextED = await getNextId(connection, 'edinburgh_history_detail', 'edinburgh_detail_id', 'ED');

    // --- 步驟 B: 寫入 assessment_history ---
    await connection.query(
      "INSERT INTO assessment_history (assessment_response_id, personal_informations_user_id, questionnaire_type_questionnaire_type_id, assessment_submit_datetime) VALUES (?, ?, ?, NOW())",
      [nextAR, user_id, 'T2'] // T2 為愛丁堡量表代碼
    );

    // --- 步驟 C: 寫入 edinburgh_history_detail ---
    await connection.query(
      "INSERT INTO edinburgh_history_detail (edinburgh_detail_id, assessment_history_assessment_response_id, edinburgh_identity_role, edinburgh_edc, total_score, advice_message) VALUES (?, ?, ?, ?, ?, ?)",
      [nextED, nextAR, form.identity, form.date, totalScore, message]
    );

    // --- 步驟 D: 迴圈寫入 10 題答案 ---
    // 先抓取目前 EA 的最大值
    let lastEA = await getNextId(connection, 'edinburgh_history_answering', 'edinburgh_answer_id', 'EA');
    
    for (const q of questions) {
      // 找出選中選項的文字內容
      const selectedOption = q.options.find(opt => opt.value === q.selectedVal);
      const selectedText = selectedOption ? selectedOption.text : "";

      await connection.query(
        "INSERT INTO edinburgh_history_answering (edinburgh_answer_id, edinburgh_history_detail_edinburgh_detail_id, edinburgh_question_key, selected_value, selected_text) VALUES (?, ?, ?, ?, ?)",
        [lastEA, nextED, q.id, q.selectedVal, selectedText]
      );
      
      // 更新下一個 EA ID (例如 EA001 -> EA002)
      lastEA = incrementId(lastEA, 'EA');
    }

    await connection.commit(); // 全部成功，提交事務
    res.json({ success: true, message: "測驗結果已成功儲存至資料庫", response_id: nextAR });

  } catch (error) {
    await connection.rollback(); // 發生錯誤，全部撤回
    console.error("提交愛丁堡量表失敗：", error);
    res.status(500).json({ message: "伺服器儲存失敗", error: error.message });
  } finally {
    connection.release(); // 釋放連線
  }
});

// 獲取特定使用者的愛丁堡量表歷史分數 (GET) - 用於繪製趨勢圖
app.get("/api/edinburgh_history/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    // 關聯 assessment_history (主表) 與 edinburgh_history_detail (明細表)
    // 並依照提交時間由舊到新排序 (ASC)，讓圖表由左至右繪製
    const sql = `
      SELECT 
        DATE_FORMAT(h.assessment_submit_datetime, '%Y-%m-%d') AS date,
        d.total_score AS score
      FROM assessment_history h
      JOIN edinburgh_history_detail d ON h.assessment_response_id = d.assessment_history_assessment_response_id
      WHERE h.personal_informations_user_id = ?
      ORDER BY h.assessment_submit_datetime ASC
    `;
    
    const [rows] = await db.query(sql, [user_id]);
    
    res.json({
      success: true,
      data: rows // 回傳格式會是 [{ date: '2025-10-15', score: 9 }, ...]
    });

  } catch (error) {
    console.error("查詢愛丁堡歷史分數趨勢錯誤：", error);
    res.status(500).json({ success: false, message: "伺服器讀取歷史紀錄失敗" });
  }
});

// 提交產前照護衛教紀錄表 (POST)
app.post("/api/submit_prenatal", authMiddleware, async (req, res) => {
  const { user_id, form, educationTopics } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // --- 步驟 A: 生成流水號 ---
    // 根據 CSV 結構，AR 對應總表，AD 對應產前詳細表
    const nextAR = await getNextId(connection, 'assessment_history', 'assessment_response_id', 'AR');
    const nextAD = await getNextId(connection, 'antepartum_history_detail', 'antepartum_detail_id', 'AD');

    // --- 步驟 B: 寫入 assessment_history (總表) ---
    // 欄位：assessment_response_id, personal_informations_user_id, questionnaire_type_questionnaire_type_id, assessment_submit_datetime
    await connection.query(
      "INSERT INTO assessment_history (assessment_response_id, personal_informations_user_id, questionnaire_type_questionnaire_type_id, assessment_submit_datetime) VALUES (?, ?, ?, NOW())",
      [nextAR, user_id, 'T1'] 
    );

    // --- 步驟 C: 寫入 antepartum_history_detail (基本資料與健康行為) ---
    // 欄位名稱需與 CSV 一致，例如 antepartum_name, smoke_habit 等
    const { behavior, medicalHistory } = form;
    await connection.query(
      `INSERT INTO antepartum_history_detail (
        antepartum_detail_id, assessment_history_assessment_response_id, 
        antepartum_name, antepartum_national_id, antepartum_birthday, antepartum_phone_number, antepartum_homephone, antepartum_address,
        smoke_habit, secondhand_smoke_environment, drinking_habit, betelnut_habit, drug_usage, depression_test1, depression_test2,
        medical_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextAD, nextAR, 
        form.name, form.idNumber, form.birthDate, form.phone, form.homePhone, form.address,
        behavior.smoking, behavior.secondhandSmoke, behavior.drinking, behavior.betelNut, behavior.drugs, 
        behavior.depression1, behavior.depression2,
        medicalHistory.hasHistory ? 1 : 0
      ]
    );

    // --- 步驟 D: 寫入醫療病史勾選項目 (antepartum_medical_history) ---
    // 欄位：medical_history _id, antepartum_history_detail_antepartum_detail_id, disease_code, disease_text, disease_note
    if (medicalHistory.hasHistory && medicalHistory.selectedItems.length > 0) {
      // 取得初始 MH 流水號
      let lastMH = await getNextId(connection, 'antepartum_medical_history', '`medical_history_id`', 'MH');
      
      for (const itemId of medicalHistory.selectedItems) {
        // 這裡需要對應您前端傳來的 disease_text，或是建立一個對照表
        const diseaseText = getMedicalLabel(itemId); // 建議在後端定義此對應函式
        const diseaseNote = (itemId === '11') ? medicalHistory.otherNote : null;

        await connection.query(
          "INSERT INTO `antepartum_medical_history` (`medical_history_id`, antepartum_history_detail_antepartum_detail_id, disease_code, disease_text, disease_note) VALUES (?, ?, ?, ?, ?)",
          [lastMH, nextAD, itemId, diseaseText, diseaseNote]
        );
        lastMH = incrementId(lastMH, 'MH'); // 更新下一個 MH ID
      }
    }

    // --- 步驟 E: 寫入衛教指導結果 (antepartum_health_education) ---
    // 欄位：health_education_id, antepartum_history_detail_antepartum_detail_id, question_index, question_answer
    let lastHE = await getNextId(connection, 'antepartum_health_education', 'health_education_id', 'HE');
    let qIndex = 1;
    for (const topic of educationTopics) {
      for (const point of topic.points) {
        await connection.query(
          "INSERT INTO antepartum_health_education (health_education_id, antepartum_history_detail_antepartum_detail_id, question_index, question_answer) VALUES (?, ?, ?, ?)",
          [lastHE, nextAD, qIndex, point.value]
        );
        lastHE = incrementId(lastHE, 'HE');
        qIndex++;
      }
    }

    await connection.commit();
    res.json({ success: true, message: "產前照護表單已成功儲存", response_id: nextAR });

  } catch (error) {
    await connection.rollback();
    console.error("提交產前表單失敗：", error);
    res.status(500).json({ success: false, message: "伺服器儲存失敗", error: error.message });
  } finally {
    connection.release();
  }
});

//醫療病史標籤對照 (需與您的 JSON 內容一致)
function getMedicalLabel(id) {
  const labels = {
    '1': '妊娠期高血壓疾病', '2': '前置胎盤', '3': '羊水過多或過少',
    '4': '胎兒生長限制', '5': '胎盤功能異常', '6': '胎兒體重過重',
    '7': '遺傳疾病', '8': '嚴重合併症', '9': '骨盆異常', '10': '子宮、產道異常',
    '11': '其他', '8-1': '心臟病', '8-2': '腎臟疾病', '8-3': '血液系統疾病',
    '8-4': '肝臟疾病', '8-5': '活動性肺結核', '8-6': '糖尿病',
    '8-7': '甲狀腺功能亢進症', '8-8': '精神病或神經系統疾病',
    '8-9': '妊娠合併免疫系統疾病', '8-10': '卵巢或子宮腫瘤',
    '8-11': '孕期感染性疾病', '8-12': '性傳染病', '8-13': '其他嚴重內外科疾病'
  };
  return labels[id] || '未知疾病';
}

async function getNextId(conn, table, column, prefix) {
  // 使用反引號處理包含空格的欄位名稱，並使用 AS 強制命名為 last_id
  const sql = `SELECT ${column} AS last_id FROM ${table} ORDER BY CAST(SUBSTRING(${column}, ${prefix.length + 1}) AS UNSIGNED) DESC LIMIT 1`;
  const [rows] = await conn.query(sql);
  
  if (rows.length === 0 || !rows[0].last_id) return `${prefix}001`;
  
  return incrementId(rows[0].last_id, prefix);
}

function incrementId(lastId, prefix) {
  if (!lastId) return `${prefix}001`; // 防呆機制
  const num = parseInt(lastId.replace(prefix, "")) + 1;
  return `${prefix}${String(num).padStart(3, '0')}`;
}


// 設定伺服器監聽的 Port
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`後端伺服器已成功啟動，正在監聽 Port ${PORT}`);
});