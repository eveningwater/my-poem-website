/**
 * 给 docs/ 分类目录下的每个 md 文件添加 frontmatter.order 字段。
 * order 值从文件名日期前缀提取（YYYYMMDD 格式的数字），无日期用 99999999。
 *
 * 用法: node scripts/add-order.js
 */
const fs = require('fs');
const path = require('path');

const CATEGORY_DIRS = [
  'old-style-poem',
  'modern-poem',
  'old-style-word',
  'classical-chinese',
  'song',
  'yuan-opera',
  'short-novel',
  'prose',
];

const docsDir = path.join(__dirname, '../docs');
let updated = 0;

for (const dir of CATEGORY_DIRS) {
  const dirPath = path.join(docsDir, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.md') && f !== 'index.md');

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 从文件名提取日期：YYYY-MM-DD-xxx.md -> 数字 YYYYMMDD
    const dateMatch = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    let order;
    if (dateMatch) {
      order = parseInt(dateMatch[1] + dateMatch[2] + dateMatch[3], 10);
    } else {
      order = 99999999;
    }

    // 检查是否已有 frontmatter
    if (content.startsWith('---\n')) {
      const endIdx = content.indexOf('\n---', 4);
      if (endIdx > 0) {
        let fm = content.slice(4, endIdx);
        // 移除已有的 order 行
        fm = fm.replace(/^order:.*\n?/m, '');
        // 在 frontmatter 末尾添加 order
        fm = fm.trimEnd() + `\norder: ${order}\n`;
        content = '---\n' + fm + content.slice(endIdx + 1);
        fs.writeFileSync(filePath, content, 'utf-8');
        updated++;
      }
    }
  }
}

console.log(`共更新 ${updated} 个文件的 frontmatter.order`);
