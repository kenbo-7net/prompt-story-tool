import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import cors from "cors";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
dotenv.config();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /generate-prompt（シチュエーション入力から）
app.post("/generate-prompt", async (req, res) => {
  try {
    const { situation } = req.body;
    const prompt = await generatePromptFromText(situation);
    res.json({ prompt });
  } catch (err) {
    console.error("🔥 プロンプト生成失敗", err);
    res.status(500).json({ error: "プロンプト生成失敗" });
  }
});

// POST /analyze-image（画像からプロンプト生成）
app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    const visionPrompt = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "この画像からAI生成プロンプトに変換してください。背景、キャラの特徴、体勢、プレイ内容まで詳細に。" },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const result = visionPrompt.choices[0].message.content;
    res.json({ prompt: result });
  } catch (err) {
    console.error("🔥 画像プロンプト生成失敗", err);
    res.status(500).json({ error: "画像プロンプト生成失敗" });
  }
});

async function generatePromptFromText(situation) {
  const systemPrompt = `以下のシチュエーションを、Stable Diffusion用プロンプトに変換してください。
構成は以下：
- 背景:
- キャラの外見:
- 表情・ポーズ:
- 服装:
- 絡み・プレイ内容:
- ネガティブプロンプト:
- 最適なLoRA:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: situation },
    ],
  });

  return response.choices[0].message.content;
}

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});
