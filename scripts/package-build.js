const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildDir = path.join(__dirname, '../my-poem-website');
const zipFileName = 'my-poem-website.zip';
const zipFilePath = path.join(__dirname, '..', zipFileName);

// 安全删除目录：防止误删到项目外或根目录
const safeRemoveDir = (dirPath) => {
  const resolved = path.resolve(dirPath);
  const projectRoot = path.resolve(__dirname, '..');

  if (resolved === projectRoot) {
    throw new Error(`拒绝删除项目根目录: ${resolved}`);
  }

  if (!resolved.startsWith(projectRoot + path.sep)) {
    throw new Error(`拒绝删除项目外目录: ${resolved}`);
  }

  // 仅允许删除预期的构建目录
  if (path.basename(resolved) !== 'my-poem-website') {
    throw new Error(`拒绝删除非预期目录: ${resolved}`);
  }

  fs.rmSync(resolved, { recursive: true, force: true });
};

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

  // 打包成功后删除原始构建目录
  safeRemoveDir(buildDir);
  console.log(`🧹 已删除构建目录: ${buildDir}`);
} catch (error) {
  console.error('打包失败:', error.message);
  process.exit(1);
}
