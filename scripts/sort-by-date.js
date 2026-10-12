/**
 * 按创作日期重命名 docs/ 分类目录下的 md 文件。
 * 文件名格式：YYYY-MM-DD-原拼音slug.md
 * 无日期的文件用 0000-00-00 前缀排最后。
 *
 * 用法: node scripts/sort-by-date.js
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

/**
 * 从 markdown 内容中提取日期
 * 返回 [创作日期, 调整日期]，格式 YYYY-MM-DD，无法解析则为 null
 */
function extractDates(content) {
  // 匹配 "创作日期" 行
  const dateLineMatch = content.match(/>\s*创作日期[：:]\s*(.+)/);
  if (!dateLineMatch) return [null, null];

  const dateLine = dateLineMatch[1];

  // 尝试提取所有 YYYY 年 M 月 D 日 格式的日期
  const datePattern = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2}|\s*xx)\s*日/g;
  const dates = [];
  let m;
  while ((m = datePattern.exec(dateLine)) !== null) {
    const year = parseInt(m[1], 10);
    let month = parseInt(m[2], 10);
    let day = m[3].trim() === 'xx' ? 1 : parseInt(m[3], 10);
    if (isNaN(month) || month < 1) month = 1;
    if (month > 12) month = 12;
    if (isNaN(day) || day < 1) day = 1;
    if (day > 31) day = 31;
    dates.push(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  }

  // 也尝试提取 YYYY/MM/DD 格式的日期
  const slashPattern = /(\d{4})\/(\d{1,2})\/(\d{1,2})/g;
  while ((m = slashPattern.exec(dateLine)) !== null) {
    const year = parseInt(m[1], 10);
    let month = parseInt(m[2], 10);
    let day = parseInt(m[3], 10);
    if (isNaN(month) || month < 1) month = 1;
    if (month > 12) month = 12;
    if (isNaN(day) || day < 1) day = 1;
    if (day > 31) day = 31;
    dates.push(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  }

  // 如果没匹配到标准格式，尝试只提取年份
  if (dates.length === 0) {
    const yearMatch = dateLine.match(/(\d{4})\s*年/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      dates.push(`${year}-01-01`);
    }
  }

  // 判断哪个是创作日期，哪个是调整日期
  let creationDate = null;
  let adjustmentDate = null;

  if (dates.length >= 1) {
    // 第一个日期通常是创作日期
    creationDate = dates[0];
    // 如果有"调整"关键词且有第二个日期，第二个是调整日期
    if (/调整|修改|改动|修订/.test(dateLine) && dates.length >= 2) {
      adjustmentDate = dates[dates.length - 1];
    }
  }

  return [creationDate, adjustmentDate];
}

function getTargetDate(content) {
  const [creation, adjustment] = extractDates(content);
  return creation || adjustment || '9999-99-99';
}

const docsDir = path.join(__dirname, '../docs');
let renamed = 0;
let noDate = 0;

for (const dir of CATEGORY_DIRS) {
  const dirPath = path.join(docsDir, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.md') && f !== 'index.md');

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const date = getTargetDate(content);

    // 去掉已有的日期前缀（防止重复运行）
    let baseName = file;
    if (/^\d{4}-\d{2}-\d{2}-/.test(baseName)) {
      baseName = baseName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    }

    const newFile = `${date}-${baseName}`;

    if (newFile === file) continue;

    const newPath = path.join(dirPath, newFile);

    // 处理重名冲突
    let finalPath = newPath;
    let n = 2;
    while (fs.existsSync(finalPath) && finalPath !== filePath) {
      finalPath = path.join(
        dirPath,
        `${date}-${baseName.replace(/\.md$/, '')}-${n}.md`,
      );
      n++;
    }

    fs.renameSync(filePath, finalPath);

    if (date === '9999-99-99') {
      noDate++;
      console.log(`[无日期] ${dir}/${file} -> ${path.basename(finalPath)}`);
    } else {
      renamed++;
      if (file !== path.basename(finalPath)) {
        console.log(`${dir}/${file} -> ${path.basename(finalPath)}`);
      }
    }
  }
}

console.log(`\n共重命名 ${renamed} 个文件，${noDate} 个无日期文件排后`);
