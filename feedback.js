import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ログディレクトリ
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

/**
 * ディレクトリ以下のすべてのJSON履歴ファイルを再帰的に取得
 */
export function getHistoryFiles(baseDir) {
  const files = [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const subfiles = getHistoryFiles(entryPath);
      files.push(...subfiles);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }
  return files;
}

/**
 * 指定ファイルにフィードバックを書き込み、ログも保存
 */
export function addFeedbackToFile(filepath, feedback) {
  if (!fs.existsSync(filepath)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(filepath));
    data.feedback = feedback;
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    const logPath = path.join(logDir, 'feedback-log.txt');
    const logEntry = `[${new Date().toISOString()}] ${path.basename(filepath)}\n${JSON.stringify(feedback)}\n\n`;
    fs.appendFileSync(logPath, logEntry);
    return true;
  } catch (err) {
    console.error('📛 フィードバック保存エラー:', err);
    return false;
  }
}

/**
 * インデックスからファイルを選び、フィードバック追加
 */
export function addFeedbackByIndex(baseDir, index, feedback) {
  const files = getHistoryFiles(baseDir);
  if (index < 0 || index >= files.length) return false;
  return addFeedbackToFile(files[index], feedback);
}

/**
 * 簡易ログ出力などにも使える（将来的な用途拡張）
 */
export function registerFeedback(entry) {
  const short = entry?.prompt?.slice(0, 50)?.replaceAll('\n', ' ');
  const logPath = path.join(logDir, 'ai-learning.txt');
  const logEntry = `[${new Date().toISOString()}] ${short}\n\n`;
  fs.appendFileSync(logPath, logEntry);
}

