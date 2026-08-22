
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API 路由
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.listen(3002, () => {
  console.log('API running at http://localhost:3002');
});
