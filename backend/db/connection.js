import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';



// 1. 取得目前檔案的絕對路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. 指向專案根目錄下的 .env 檔案
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export default pool.promise();

console.log('DB_NAME:', process.env.DB_NAME);