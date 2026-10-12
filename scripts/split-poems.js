/**
 * 将 docs/ 下的分类大文件拆分为「一首诗/词对应一个 md 文件」的目录结构。
 *
 * 用法:
 *   DRY_RUN=1 node scripts/split-poems.js   # 只输出统计信息，不写文件
 *   node scripts/split-poems.js             # 真正执行拆分
 */
const fs = require('fs');
const path = require('path');
const { pinyin } = require('./vendor/pinyin-pro.cjs.js');

const DRY_RUN = process.env.DRY_RUN === '1';

// 分类文件 -> 目录名 / 分类中文名 / 简介
const CATEGORY_MAP = {
  'old-style-poem.md': { dir: 'old-style-poem', name: '旧体诗', intro: '收录个人创作的旧体诗作品。' },
  'modern-poem.md': { dir: 'modern-poem', name: '现代诗', intro: '收录个人创作的现代诗作品。' },
  'old-style-word.md': { dir: 'old-style-word', name: '旧体词', intro: '收录个人创作的旧体词作品。' },
  'classical-chinese.md': { dir: 'classical-chinese', name: '文言文', intro: '收录个人创作的文言文作品。' },
  'song.md': { dir: 'song', name: '歌曲', intro: '收录个人创作的歌曲作品。' },
  'yuan-opera.md': { dir: 'yuan-opera', name: '元曲', intro: '收录个人创作的元曲作品。' },
  'short-novel.md': { dir: 'short-novel', name: '短篇小说', intro: '收录个人创作的短篇小说作品。' },
  'prose.md': { dir: 'prose', name: '散文', intro: '收录个人创作的散文作品。' },
};

// 续篇关键词：h2 标题包含这些词时，并入前一首
const CONTINUATION_KEYWORDS = [
  '调整版',
  '改写版',
  '修改版',
  '继续改写版',
  '文雅版',
  '自译',
  '自注',
  '调整',
  '其它版本',
];

function isContinuation(title) {
  return CONTINUATION_KEYWORDS.some((k) => title.includes(k));
}

// 文件名清洗：标题转拼音 slug（dumi 路由只允许 ASCII 字母数字、连字符和斜杠）
function sanitizeFilename(name) {
  const parts = pinyin(name, { toneType: 'none', type: 'array' });
  // 合并连续的单字符数字/字母（如 "2","0","2","5" -> "2025"）
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
  return merged
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 标题降一级：## -> ###，### -> ####
function demoteHeadings(text) {
  return text.replace(/^(#{2,5}) /gm, '#$1 ');
}

function splitFile(fileName, config) {
  const docsDir = path.join(__dirname, '../docs');
  const filePath = path.join(docsDir, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 1. 去掉 frontmatter
  let start = 0;
  if (lines[0].trim() === '---') {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
    if (end > 0) start = end + 1;
  }

  // 2. 按 h2 切块（忽略 <code src> 等 preamble）
  const blocks = []; // { title, lines: [] }
  let current = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (/^## /.test(line)) {
      current = { title: line.replace(/^##\s+/, '').trim(), lines: [] };
      blocks.push(current);
    } else if (current) {
      current.lines.push(line);
    }
    // h2 之前的非 frontmatter 内容（<code src> 行等）直接丢弃
  }

  // 3. 归并续篇块
  const poems = []; // { title, bodyLines: [] }
  const mergedTitles = [];
  for (const block of blocks) {
    if (isContinuation(block.title) && poems.length > 0) {
      const prev = poems[poems.length - 1];
      // 续篇标题降一级作为子标题，块内已有标题也降一级
      prev.bodyLines.push(`### ${block.title}`, ...demoteHeadings(block.lines.join('\n')).split('\n'));
      mergedTitles.push(`${block.title}  ->  ${prev.title}`);
    } else {
      poems.push({ title: block.title, bodyLines: block.lines });
    }
  }

  // 4. 文件名去重
  const usedNames = new Map(); // baseName -> count
  const outputs = poems.map((poem) => {
    let base = sanitizeFilename(poem.title);
    if (!base) base = 'untitled';
    const count = usedNames.get(base) || 0;
    usedNames.set(base, count + 1);
    const filename = count === 0 ? `${base}.md` : `${base}-${count + 1}.md`;
    return { ...poem, filename };
  });

  // 5. 写文件
  const targetDir = path.join(docsDir, config.dir);
  if (!DRY_RUN) {
    fs.mkdirSync(targetDir, { recursive: true });

    // 分类首页 index.md
    const indexContent = `---\nnav: ${config.name}\ntitle: ${config.name}\n---\n\n${config.intro}\n`;
    fs.writeFileSync(path.join(targetDir, 'index.md'), indexContent, 'utf-8');

    for (const out of outputs) {
      // 去掉正文开头的空行
      let body = out.bodyLines.join('\n').replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trimEnd();
      const fileContent = `---\ntitle: ${out.title}\n---\n\n${body}\n`;
      fs.writeFileSync(path.join(targetDir, out.filename), fileContent, 'utf-8');
    }
  }

  return {
    category: config.name,
    total: outputs.length,
    merged: mergedTitles,
    duplicates: outputs.filter((o) => /-\d+\.md$/.test(o.filename)).map((o) => `${o.title} -> ${o.filename}`),
  };
}

// 执行
const report = [];
for (const [fileName, config] of Object.entries(CATEGORY_MAP)) {
  const result = splitFile(fileName, config);
  report.push(result);
  console.log(`\n=== ${result.category} (${fileName}) ===`);
  console.log(`拆出文件数: ${result.total}`);
  console.log(`归并续篇数: ${result.merged.length}`);
  console.log(`重名加后缀: ${result.duplicates.length}`);
}

console.log('\n\n===== 汇总 =====');
console.log(`总文件数: ${report.reduce((s, r) => s + r.total, 0)}`);
console.log(`总归并数: ${report.reduce((s, r) => s + r.merged.length, 0)}`);

console.log('\n===== 归并的续篇明细 =====');
for (const r of report) {
  for (const m of r.merged) console.log(`[${r.category}] ${m}`);
}

console.log('\n===== 重名处理明细 =====');
for (const r of report) {
  for (const d of r.duplicates) console.log(`[${r.category}] ${d}`);
}

console.log(DRY_RUN ? '\n[DRY_RUN] 未写入任何文件' : '\n拆分完成');
