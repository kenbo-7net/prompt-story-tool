import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ログ保存ディレクトリ
const logDir = path.join(__dirname, 'logs');
await fs.mkdir(logDir, { recursive: true });

/**
 * 全履歴ファイルを再帰的に取得（.jsonのみ）
 */
export async function getHistoryFiles(baseDir) {
  const result = [];
  const entries = await fs.readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const nested = await getHistoryFiles(fullPath);
      result.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * 指定ファイルにフィードバックを保存 + ログ記録
 */
export async function addFeedbackToFile(filepath, feedback) {
  try {
    const raw = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(raw);
    data.feedback = feedback;
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    const logEntry = {
      timestamp: new Date().toISOString(),
      file: path.basename(filepath),
      feedback
    };

    await writeLog('feedback', logEntry);
    return true;
  } catch (err) {
    console.error('📛 フィードバック保存エラー:', err);
    return false;
  }
}

/**
 * インデックス指定でフィードバック保存
 */
export async function addFeedbackByIndex(baseDir, index, feedback) {
  const files = await getHistoryFiles(baseDir);
  if (index < 0 || index >= files.length) return false;
  return await addFeedbackToFile(files[index], feedback);
}

/**
 * 簡易フィードバックログ（学習用など）
 */
export async function registerFeedback(entry) {
  const short = entry?.prompt?.slice(0, 60)?.replaceAll('\n', ' ');
  const logEntry = {
    timestamp: new Date().toISOString(),
    prompt: short
  };

  await writeLog('learning', logEntry);
}

/**
 * ログファイルを日付別に保存
 */
async function writeLog(type, data) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${type}-log-${date}.jsonl`;
  const logPath = path.join(logDir, filename);
  const line = JSON.stringify(data) + '\n';
  await fs.appendFile(logPath, line);
}
