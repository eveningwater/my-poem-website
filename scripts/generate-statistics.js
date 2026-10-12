const fs = require('fs');
const path = require('path');

// 目录类型映射（一诗一文件的目录）
const DIR_TYPE_MAP = {
  'old-style-poem': '旧体诗',
  'old-style-word': '旧体词',
  'modern-poem': '现代诗',
  'song': '歌曲',
  'yuan-opera': '元曲',
  'prose': '散文',
  'classical-chinese': '文言文',
  'short-novel': '短篇小说',
};

// 单文件类型映射（多条目文件，仍按 h2 统计）
const FILE_TYPE_MAP = {
  'couplet.md': '对联',
  'sentence.md': '句',
};

const CHINESE_DIGITS = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

function parseChineseNumber(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return 0;
  if (!trimmed.includes('十')) return CHINESE_DIGITS[trimmed] || 0;
  if (trimmed === '十') return 10;
  const parts = trimmed.split('十');
  const tens = parts[0] ? CHINESE_DIGITS[parts[0]] || 0 : 1;
  const ones = parts[1] ? CHINESE_DIGITS[parts[1]] || 0 : 0;
  return tens * 10 + ones;
}

/**
 * 从标题中提取数量（如"论诗二首" -> 2）
 */
function extractCountFromTitle(title) {
  const match = title.match(/([一二三四五六七八九十]+)首/);
  if (match) {
    return parseChineseNumber(match[1]) || 1;
  }
  return 1;
}

/**
 * 检查是否是"其一"、"其二"等格式
 */
function isSequenceTitle(title) {
  return /^[（(]?其[一二三四五六七八九十]+[）)]?$/.test(title.trim());
}

/**
 * 从文件内容中提取 frontmatter title
 */
function extractTitle(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    const titleLine = match[1]
      .split('\n')
      .find((line) => /^title:\s*/.test(line));
    if (titleLine) return titleLine.replace(/^title:\s*/, '').trim();
  }
  return '';
}

/**
 * 统计单篇作品文件的数量
 * 规则：基础 1 篇；h3 的"其一/其二"有 N 个按 N 计（优先）；
 * 标题含"X首"按 X 计；"创作日期"行数兜底
 */
function countWorksInPoemFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // "其一"、"其二"序列（h3）
  let sequenceCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ') && isSequenceTitle(trimmed.replace(/^###\s+/, ''))) {
      sequenceCount++;
    }
  }
  if (sequenceCount > 0) return sequenceCount;

  // 标题含"X首"
  const title = extractTitle(content);
  const titleCount = extractCountFromTitle(title);
  if (titleCount > 1) return titleCount;

  // 基础 1 篇
  return 1;
}

/**
 * 统计多条目文件（对联、句）的作品数量：按 h2 标题数
 */
function countWorksInMultiEntryFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter((line) => /^## /.test(line)).length;
}

/**
 * 统计目录下所有单篇作品文件
 */
function countWorksInDir(dirPath) {
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.md') && f !== 'index.md');
  let count = 0;
  for (const file of files) {
    count += countWorksInPoemFile(path.join(dirPath, file));
  }
  return count;
}

/**
 * 统计所有作品
 */
function getStatistics() {
  const docsDir = path.join(__dirname, '../docs');
  const stats = { total: 0 };

  // 初始化所有类型
  [...Object.values(DIR_TYPE_MAP), ...Object.values(FILE_TYPE_MAP)].forEach(
    (type) => {
      stats[type] = 0;
    },
  );

  // 目录扫描
  for (const [dir, type] of Object.entries(DIR_TYPE_MAP)) {
    const dirPath = path.join(docsDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    const count = countWorksInDir(dirPath);
    stats[type] += count;
    stats.total += count;
  }

  // 多条目单文件
  for (const [file, type] of Object.entries(FILE_TYPE_MAP)) {
    const filePath = path.join(docsDir, file);
    if (!fs.existsSync(filePath)) continue;
    const count = countWorksInMultiEntryFile(filePath);
    stats[type] += count;
    stats.total += count;
  }

  return stats;
}

// 生成统计数据
try {
  const stats = getStatistics();
  const outputPath = path.join(__dirname, '../public/statistics.json');

  // 确保 public 目录存在
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 写入统计数据
  fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf-8');
  console.log('统计数据已生成:', JSON.stringify(stats, null, 2));
  console.log('输出路径:', outputPath);
} catch (error) {
  console.error('生成统计数据时出错:', error);
  process.exit(1);
}
