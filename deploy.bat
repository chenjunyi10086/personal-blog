@echo off
echo 🚀 chenjunyi个人博客 - GitHub部署脚本
echo ========================================

REM 检查是否安装了Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git未安装，请先安装Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 检查是否安装了Node.js
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js未安装，请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ 环境检查通过

REM 构建项目
echo 🔨 构建项目...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✅ 项目构建完成

REM 检查是否是Git仓库
if not exist ".git" (
    echo 📝 初始化Git仓库...
    git init
    git config --global user.name "chenjunyi"
    git config --global user.email "your-email@example.com"
    
    echo 📋 请在GitHub上创建新仓库 'personal-blog'
    echo 然后按任意键继续...
    pause
    
    set /p repo_url="请输入您的GitHub仓库URL: "
    git remote add origin %repo_url%
)

REM 添加并提交文件
echo 📦 提交文件到Git...
git add .
git commit -m "🎉 初始化个人博客项目" 2>nul

REM 推送到主分支
echo 📤 推送到GitHub...
git branch -M main
git push -u origin main

REM 部署到GitHub Pages
echo 🌐 部署到GitHub Pages...
call npm run build

git checkout --orphan gh-pages 2>nul
git rm -rf . 2>nul

REM 复制构建文件
xcopy /E /I /Y dist\*.* . 2>nul
echo .nojekyll > .nojekyll

git add .
git commit -m "🚀 Deploy to GitHub Pages"
git push origin gh-pages --force
git checkout main

echo.
echo 🎉 部署完成！
echo.
echo 📱 访问地址: https://yourusername.github.io/personal-blog
echo 📖 仓库地址: https://github.com/yourusername/personal-blog
echo.
echo ⚠️  请记得：
echo 1. 在GitHub仓库设置中启用GitHub Pages
echo 2. 选择gh-pages分支作为源
echo 3. 等待几分钟让部署完成
echo.
pause