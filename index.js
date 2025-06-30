import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(bodyParser.json());

// __dirname 対応（ESM環境）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ publicフォルダを静的ファイルとして配信
app.use(express.static(path.join(__dirname, 'public')));

// ✅ トップページに来たとき index.html を返すようにする
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', async (req, res) => {
  const { situation } = req.body;

  const promptText = `シチュエーション「${situation}」に最適な画像生成プロンプ
