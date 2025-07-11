import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { createCanvas, loadImage } from 'canvas';

const galleryRouter = express.Router();
const galleryDir = path.join(os.tmpdir(), 'gallery');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

const upload = multer({ dest: galleryDir });

// 🖼 画像アップロード
galleryRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '画像がありません' });
  const id = path.basename(req.file.filename);
  const caption = req.body.caption || '';
  const entry = { id, caption, path: req.file.path };
  const jsonPath = path.join(galleryDir, `${id}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(entry, null, 2));
  res.json(entry);
});

// 🖼 ギャラリー一覧取得
galleryRouter.get('/list', (req, res) => {
  const files = fs.readdirSync(galleryDir);
  const entries = files.filter(f => f.endsWith('.json')).map(f => {
    const json = JSON.parse(fs.readFileSync(path.join(galleryDir, f)));
    return json;
  });
  res.json(entries);
});

// 🧠 セリフ生成API（ダミー）
galleryRouter.post('/dialogue', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: '画像IDが必要です' });
  const jsonPath = path.join(galleryDir, `${id}.json`);
  if (!fs.existsSync(jsonPath)) return res.status(404).json({ error: '画像が見つかりません' });
  const entry = JSON.parse(fs.readFileSync(jsonPath));
  entry.caption = `Generated caption for ${id}`;
  fs.writeFileSync(jsonPath, JSON.stringify(entry, null, 2));
  res.json(entry);
});

// 🗜 セリフ焼き込み画像ZIP出力
galleryRouter.get('/export-captioned', async (req, res) => {
  const files = fs.readdirSync(galleryDir).filter(f => f.endsWith('.json'));
  const captionedDir = path.join(galleryDir, 'captioned');
  if (!fs.existsSync(captionedDir)) fs.mkdirSync(captionedDir, { recursive: true });

  // 画像にセリフを描画
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(galleryDir, file)));
    const imgPath = path.join(galleryDir, data.id);
    const caption = data.caption || '';
    const image = await loadImage(imgPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    ctx.font = `${Math.floor(image.height * 0.05)}px sans-serif`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(caption, 20, image.height - 40);
    ctx.fillStyle = 'white';
    ctx.fillText(caption, 20, image.height - 40);
    const outPath = path.join(captionedDir, `${data.id}_captioned.png`);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  }

  // ZIPにまとめて送信
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=captioned_images.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(captionedDir, false);
  archive.finalize();
});

export default galleryRouter;
