// server/zip-exporter.js
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';
import moment from 'moment';
import sanitize from 'sanitize-filename';

const historyDir = path.join(os.tmpdir(), 'prompt-history');

/**
 * 再帰的にファイル一覧を取得（サブディレクトリ含む）
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

/**
 * 履歴ZIP出力関数
 */
export async function exportHistoryAsZip() {
  return new Promise((resolve, reject) => {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const zipPath = path.join(os.tmpdir(), `history_${timestamp}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const zipBuffer = fs.readFileSync(zipPath);
      resolve(zipBuffer);
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    // 実ファイルが存在する場合のみ追加
    if (fs.existsSync(historyDir)) {
      const files = getAllFiles(historyDir);
      if (files.length === 0) {
        addSampleToArchive(archive);
      } else {
        for (const filePath of files) {
          const relativePath = path.relative(historyDir, filePath);
          const safePath = sanitize(relativePath);
          archive.file(filePath, { name: safePath });
        }
      }
    } else {
      addSampleToArchive(archive);
    }

    archive.finalize();
  });
}

/**
 * サンプルデータをZIPに追加（履歴がない場合）
 */
function addSampleToArchive(archive) {
  const sampleData = JSON.stringify({
    prompt: 'High quality 8K hentai scene with blonde girl',
    negative_prompt: 'bad anatomy, blurry, low quality',
    model: 'aamAnyloraAnimeMix_v1',
    timestamp: new Date().toISOString()
  }, null, 2);

  archive.append(sampleData, { name: 'sample-history.json' });
}
