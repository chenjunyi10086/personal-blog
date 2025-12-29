@echo off
chcp 65001 >nul
echo Deploying chenjunyi's personal blog to GitHub...
echo ========================================

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if Node.js is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Environment check passed

REM Build project
echo Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed
    pause
    exit /b 1
)

echo Project build completed

REM Check if this is a Git repository
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git config --global user.name "chenjunyi"
    git config --global user.email "your-email@example.com"
    
    echo Please create a new repository 'personal-blog' on GitHub
    echo Then press any key to continue...
    pause
    
    set /p repo_url="Please enter your GitHub repository URL: "
    git remote add origin %repo_url%
)

REM Add and commit files
echo Committing files to Git...
git add .
git commit -m "Initialize personal blog project" 2>nul

REM Push to main branch
echo Pushing to GitHub...
git branch -M main
git push -u origin main

REM Deploy to GitHub Pages
echo Deploying to GitHub Pages...
call npm run build

git checkout --orphan gh-pages 2>nul
git rm -rf . 2>nul

REM Copy build files
xcopy /E /I /Y dist\*.* . 2>nul
echo .nojekyll > .nojekyll

git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
git checkout main

echo.
echo Deployment completed!
echo.
echo Website URL: https://yourusername.github.io/personal-blog
echo Repository URL: https://github.com/yourusername/personal-blog
echo.
echo Please remember:
echo 1. Enable GitHub Pages in your repository settings
echo 2. Select gh-pages branch as the source
echo 3. Wait a few minutes for deployment to complete
echo.
pause