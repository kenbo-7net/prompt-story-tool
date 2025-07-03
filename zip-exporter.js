// server/zip-exporter.js
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 仮の履歴保存ディレクトリ（実際には履歴JSONをここに保存している想定）
const historyDir = path.join(os.tmpdir(), 'prompt-history');

// 履歴ZIP出力関数
export async function exportHistoryAsZip() {
  return new Promise((resolve, reject) => {
    // 一時的なZIPファイルの保存先
    const zipPath = path.join(os.tmpdir(), 'history_export.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const zipBuffer = fs.readFileSync(zipPath);
      resolve(zipBuffer);
    });

    archive.on('error', err => reject(err));
    archive.pipe(output);

    // 保存されている履歴ファイルを全て追加（なければサンプルデータを追加）
    if (fs.existsSync(historyDir)) {
      const files = fs.readdirSync(historyDir);
      files.forEach(file => {
        const filePath = path.join(historyDir, file);
        archive.file(filePath, { name: file });
      });
    } else {
      // テスト用サンプルJSONを追加
      const sampleData = JSON.stringify({
        prompt: 'High quality 8K hentai scene with blonde girl',
        negative_prompt: 'bad anatomy, blurry, low quality',
        model: 'aamAnyloraAnimeMix_v1',
        timestamp: new Date().toISOString()
      }, null, 2);
      archive.append(sampleData, { name: 'sample-history.json' });
    }

    archive.finalize();
  });
}
