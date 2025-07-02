import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import { OpenAI } from "openai";
import fs from "fs";

const app = express();
const port = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 画像アップロード用の設定
const upload = multer({ dest: "uploads/" });

// POST /api/prompt - シチュエーションからプロンプトを生成
app.post("/api/prompt", async (req, res) => {
  const { situation } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは、Stable Diffusion 用プロンプト構築の専門家です。"
        },
        {
          role: "user",
          content: `シチュエーション「${situation}」に基づき、人物像・構図・服装・背景・セックス内容を含む英語のプロンプトを構成してください。`,
        },
      ]
    });

    const prompt = chatCompletion.choices[0].message.content;
    res.json({ prompt });
  } catch (error) {
    console.error("❌ APIエラー:", error);
    res.status(500).json({ error: "プロンプト生成に失敗しました" });
  }
});

// POST /api/image - 画像をアップロードし分析（準備中）
app.post("/api/image", upload.single("image"), async (req, res) => {
  // 今後、画像の特徴を分析してプロンプトに反映する処理を実装予定
  return res.status(501).json({ message: "未実装です" });
});

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});

