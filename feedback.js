const fs = require('fs');
const path = require('path');

// ログ・履歴用フォルダ作成
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// キャラ別 or ID別の履歴ディレクトリ構成を許容
function getHistoryFiles(baseDir) {
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
 * 任意のファイルにフィードバックを追加・更新し、ログ保存も行う
 * @param {string} filepath - フィードバック対象JSONファイル
 * @param {object|string} feedback - 例: 'like', { rating: 4, comment: '良い' }
 * @returns {boolean} 保存成功フラグ
 */
function addFeedbackToFile(filepath, feedback) {
  if (!fs.existsSync(filepath)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(filepath));
    data.feedback = feedback;
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    // ログ出力
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
 * インデックスベースでファイルを探し、フィードバックを追加
 * @param {string} baseDir - 履歴ディレクトリ
 * @param {number} index - 対象ファイルの通し番号
 * @param {object|string} feedback - 評価内容
 * @returns {boolean} 成功可否
 */
function addFeedbackByIndex(baseDir, index, feedback) {
  const files = getHistoryFiles(baseDir);
  if (index < 0 || index >= files.length) return false;
  return addFeedbackToFile(files[index], feedback);
}

module.exports = {
  addFeedbackToFile,
  addFeedbackByIndex,
  getHistoryFiles
};
