import fs from 'fs';
import path from 'path';

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
const FILE_TYPE_MAP: Record<string, string> = {
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

interface Statistics {
  [key: string]: number;
  total: number;
}

/**
 * 检查标题是否应该被排除
 */
function shouldExclude(title: string): boolean {
  return EXCLUDE_KEYWORDS.some((keyword) => title.includes(keyword));
}

/**
 * 从标题中提取数量（如"论诗二首" -> 2）
 */
function extractCountFromTitle(title: string): number {
  const match = title.match(/([一二三四五六七八九十]+)首/);
  if (match) {
    const chineseNumbers: Record<string, number> = {
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
function isSequenceTitle(title: string): boolean {
  return /^[（(]?其[一二三四五六七八九十]+[）)]?$/.test(title.trim());
}

/**
 * 统计单个文件的作品数量
 */
function countWorksInFile(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let count = 0;
  let currentH2Title = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检查二级标题
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s+/, '');
      currentH2Title = title;
      
      // 排除不需要的标题
      if (!shouldExclude(title)) {
        // 检查是否包含"X首"
        const titleCount = extractCountFromTitle(title);
        if (titleCount > 1) {
          count += titleCount;
        } else {
          count += 1;
        }
      }
    }
    
    // 检查三级标题（其一、其二等）
    if (line.startsWith('### ')) {
      const title = line.replace(/^###\s+/, '');
      if (isSequenceTitle(title) && !shouldExclude(currentH2Title)) {
        // 如果父级标题已经按"X首"计算了，这里就不重复计算
        // 但如果父级标题没有"X首"，则需要单独计算
        const titleCount = extractCountFromTitle(currentH2Title);
        if (titleCount === 1) {
          count += 1;
        }
      }
    }
  }
  
  return count;
}

/**
 * 统计所有作品
 */
export function getStatistics(): Statistics {
  const docsDir = path.join(process.cwd(), 'docs');
  const stats: Statistics = {
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

