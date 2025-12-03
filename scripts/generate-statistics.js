const fs = require('fs');
const path = require('path');

// 需要排除的标题关键词
const EXCLUDE_KEYWORDS = [
  '调整版',
  '改写版',
  '修改版',
  '继续改写版',
  '文雅版',
  '自译',
  '自注',
  '调整',
];

// 文件类型映射
const FILE_TYPE_MAP = {
  'old-style-poem.md': '旧体诗',
  'old-style-word.md': '旧体词',
  'modern-poem.md': '现代诗',
  'song.md': '歌曲',
  'couplet.md': '对联',
  'yuan-opera.md': '元曲',
  'classical-chinese.md': '文言文',
  'short-novel.md': '短篇小说',
  'sentence.md': '句',
};

/**
 * 检查标题是否应该被排除
 */
function shouldExclude(title) {
  return EXCLUDE_KEYWORDS.some((keyword) => title.includes(keyword));
}

/**
 * 从标题中提取数量（如"论诗二首" -> 2）
 */
function extractCountFromTitle(title) {
  const match = title.match(/([一二三四五六七八九十]+)首/);
  if (match) {
    const chineseNumbers = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
    };
    const chineseNum = match[1];
    let count = 0;
    for (const char of chineseNum) {
      if (chineseNumbers[char]) {
        count = count * 10 + chineseNumbers[char];
      }
    }
    return count || 1;
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
 * 统计单个文件的作品数量
 */
function countWorksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let count = 0;
  let currentH2Title = '';
  let currentH2Index = -1;
  let h2HasSequence = false; // 当前H2标题下是否有"其一"、"其二"等
  let sequenceCount = 0; // "其一"、"其二"等的数量
  
  // 第一遍遍历：找出所有H2标题及其下的"其一"、"其二"数量
  const h2List = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s+/, '');
      if (!shouldExclude(title)) {
        h2List.push({
          title,
          index: i,
          hasSequence: false,
          sequenceCount: 0,
        });
      }
    }
  }
  
  // 第二遍遍历：统计每个H2下的"其一"、"其二"数量
  for (let i = 0; i < h2List.length; i++) {
    const h2 = h2List[i];
    const nextH2Index = i < h2List.length - 1 ? h2List[i + 1].index : lines.length;
    
    // 在当前H2和下一个H2之间查找"其一"、"其二"
    for (let j = h2.index + 1; j < nextH2Index; j++) {
      const line = lines[j].trim();
      if (line.startsWith('### ')) {
        const title = line.replace(/^###\s+/, '');
        if (isSequenceTitle(title)) {
          h2.hasSequence = true;
          h2.sequenceCount++;
        }
      }
    }
  }
  
  // 第三遍：计算总数
  for (const h2 of h2List) {
    const titleCount = extractCountFromTitle(h2.title);
    
    if (h2.hasSequence) {
      // 如果有"其一"、"其二"等，按"其一"、"其二"的数量计算
      count += h2.sequenceCount;
    } else if (titleCount > 1) {
      // 如果标题包含"X首"，按X计算
      count += titleCount;
    } else {
      // 普通标题，按1计算
      count += 1;
    }
  }
  
  return count;
}

/**
 * 统计所有作品
 */
function getStatistics() {
  const docsDir = path.join(__dirname, '../docs');
  const stats = {
    total: 0,
  };
  
  // 初始化所有类型
  Object.values(FILE_TYPE_MAP).forEach((type) => {
    stats[type] = 0;
  });
  
  // 遍历所有文件
  const files = fs.readdirSync(docsDir);
  
  for (const file of files) {
    if (!file.endsWith('.md') || file === 'index.md' || file === 'novel-design.md') {
      continue;
    }
    
    const filePath = path.join(docsDir, file);
    const fileType = FILE_TYPE_MAP[file];
    
    if (fileType) {
      const count = countWorksInFile(filePath);
      stats[fileType] = count;
      stats.total += count;
    }
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

