const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT * FROM schedule LIMIT 5');
    console.log('成功讀取模擬資料：', rows);
  } catch (err) {
    console.error('連線失敗：', err);
  }
}

testConnection();
module.exports = promisePool;