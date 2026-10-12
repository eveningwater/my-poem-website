/**
 * 将 docs/ 分类目录下不符合 dumi 路由规则（非 ASCII）的 md 文件名
 * 归一化为拼音 slug。用于兼容 CMS 后台创建的中文文件名。
 */
const fs = require('fs');
const path = require('path');
const { pinyin } = require('./vendor/pinyin-pro.cjs.js');

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

const VALID_NAME = /^[a-z0-9-]+\.md$/;

function toSlug(base) {
  const parts = pinyin(base, { toneType: 'none', type: 'array' });
  const merged = [];
  for (const part of parts) {
    const prev = merged[merged.length - 1];
    if (
      prev !== undefined &&
      /^[a-zA-Z0-9]$/.test(prev[prev.length - 1]) &&
      /^[a-zA-Z0-9]$/.test(part)
    ) {
      merged[merged.length - 1] = prev + part;
    } else {
      merged.push(part);
    }
  }
  return (
    merged
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled'
  );
}

const docsDir = path.join(__dirname, '../docs');
let renamed = 0;

for (const dir of CATEGORY_DIRS) {
  const dirPath = path.join(docsDir, dir);
  if (!fs.existsSync(dirPath)) continue;

  for (const file of fs.readdirSync(dirPath)) {
    if (!file.endsWith('.md') || file === 'index.md') continue;
    if (VALID_NAME.test(file)) continue;

    const base = file.replace(/\.md$/, '');
    let slug = toSlug(base);
    let target = `${slug}.md`;
    let n = 2;
    while (fs.existsSync(path.join(dirPath, target))) {
      target = `${slug}-${n}.md`;
      n++;
    }

    fs.renameSync(path.join(dirPath, file), path.join(dirPath, target));
    console.log(`重命名: ${dir}/${file} -> ${dir}/${target}`);
    renamed++;
  }
}

if (renamed === 0) {
  console.log('文件名检查通过，无需重命名');
} else {
  console.log(`共重命名 ${renamed} 个文件`);
}
