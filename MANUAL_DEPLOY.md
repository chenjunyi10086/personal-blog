# 🚀 手动部署步骤

## 1. 打开命令行
按 `Win + R`，输入 `cmd`，回车

## 2. 切换到项目目录
```cmd
cd c:/Users/34974/Desktop/personal-blog
```

## 3. 初始化Git仓库
```cmd
git init
git config user.name "chenjunyi"
git config user.email "your-email@example.com"
```

## 4. 添加远程仓库
```cmd
git remote add origin https://github.com/chenjunyi10086/personal-blog.git
```

## 5. 构建项目
```cmd
npm run build
```

## 6. 提交并推送代码
```cmd
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## 7. 部署到GitHub Pages
```cmd
git checkout --orphan gh-pages
git rm -rf .
xcopy /E /I /Y dist\*.* .
echo .nojekyll > .nojekyll
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
git checkout main
```

## 8. 配置GitHub Pages
1. 访问您的GitHub仓库
2. 点击 Settings
3. 在左侧菜单找到 Pages
4. Source 选择 "Deploy from a branch"
5. Branch 选择 "gh-pages"
6. 文件夹选择 "/ (root)"
7. 点击 Save

等待几分钟后，您的博客将在以下地址可访问：
https://chenjunyi10086.github.io/personal-blog

---

**复制这些命令到命令行中逐步执行**