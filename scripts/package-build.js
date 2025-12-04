const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildDir = path.join(__dirname, '../my-poem-website');
const zipFileName = 'my-poem-website.zip';
const zipFilePath = path.join(__dirname, '..', zipFileName);

// 检查构建目录是否存在
if (!fs.existsSync(buildDir)) {
  console.error(`错误: 构建目录 ${buildDir} 不存在，请先运行 npm run build`);
  process.exit(1);
}

console.log('开始打包构建产物...');

try {
  // 如果已存在 zip 文件，先删除
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
    console.log('已删除旧的 zip 文件');
  }

  // 使用系统命令创建 zip 文件
  // macOS/Linux 使用 zip 命令
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Windows 使用 PowerShell 的 Compress-Archive
    const command = `powershell -Command "Compress-Archive -Path '${buildDir}\\*' -DestinationPath '${zipFilePath}' -Force"`;
    execSync(command, { stdio: 'inherit' });
  } else {
    // macOS/Linux 使用 zip 命令
    const command = `cd ${path.dirname(buildDir)} && zip -r ${zipFileName} ${path.basename(buildDir)}`;
    execSync(command, { stdio: 'inherit' });
  }

  // 检查文件大小
  const stats = fs.statSync(zipFilePath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ 打包完成!`);
  console.log(`📦 文件: ${zipFilePath}`);
  console.log(`📊 大小: ${fileSizeInMB} MB`);
} catch (error) {
  console.error('打包失败:', error.message);
  process.exit(1);
}

