# 🚀 GitHub 部署指南

## 📋 第一步：安装 Git

### Windows 用户
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载并安装 Git for Windows
3. 安装时选择默认选项即可
4. 安装后重新打开命令行工具

### 验证安装
```bash
git --version
```

## 📁 第二步：创建 GitHub 仓库

1. **访问 GitHub**
   - 打开 [github.com](https://github.com)
   - 登录您的账号

2. **创建新仓库**
   - 点击右上角 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`personal-blog`
   - 描述：`chenjunyi的个人博客 - Vue3现代化个人网站`
   - 设置为 **Public**（公开）
   - **不要**勾选 "Add a README file"（我们已经有了）
   - 点击 "Create repository"

## 🔧 第三步：本地 Git 操作

### 1. 初始化 Git 仓库
```bash
cd c:/Users/34974/Desktop/personal-blog
git init
```

### 2. 配置 Git 用户信息（首次使用）
```bash
git config --global user.name "chenjunyi"
git config --global user.email "your-email@example.com"
```

### 3. 添加文件到暂存区
```bash
git add .
```

### 4. 提交文件
```bash
git commit -m "🎉 初始化个人博客项目"
```

### 5. 关联远程仓库
```bash
git remote add origin https://github.com/yourusername/personal-blog.git
```

> 🔑 **注意**：将 `yourusername` 替换为您的 GitHub 用户名

### 6. 推送到 GitHub
```bash
git branch -M main
git push -u origin main
```

## 🌐 第四步：部署到 GitHub Pages

### 方法一：直接使用 dist 分支

1. **安装 gh-pages 包**
```bash
npm install --save-dev gh-pages
```

2. **修改 package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

3. **部署到 GitHub Pages**
```bash
npm run deploy
```

### 方法二：手动部署（推荐）

1. **构建项目**
```bash
npm run build
```

2. **创建 gh-pages 分支**
```bash
git checkout --orphan gh-pages
git rm -rf .
```

3. **复制构建文件**
```bash
cp -r dist/* .
cp dist/.gitignore . 2>/dev/null || true
echo "yourdomain.com" > CNAME  # 可选：自定义域名
touch .nojekyll
```

4. **提交并推送**
```bash
git add .
git commit -m "🚀 Deploy to GitHub Pages"
git push origin gh-pages --force
git checkout main
```

## ⚙️ 第五步：配置 GitHub Pages

1. **进入仓库设置**
   - 在您的 GitHub 仓库页面
   - 点击 "Settings" 选项卡

2. **配置 Pages**
   - 在左侧菜单找到 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages"
   - 文件夹选择 "/ (root)"
   - 点击 "Save"

3. **等待部署**
   - GitHub 会自动部署您的网站
   - 几分钟后在 Pages 页面会显示网站链接

## 🎯 访问您的网站

部署成功后，您的网站可以通过以下地址访问：
```
https://yourusername.github.io/personal-blog
```

## 🔄 自动部署（可选）

### GitHub Actions 自动部署

1. **创建工作流文件**
   在项目根目录创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. **启用自动部署**
   - 将文件推送到 GitHub
   - 在仓库设置中确保 GitHub Pages 启用
   - 之后每次推送到 main 分支都会自动部署

## 🛠️ 常见问题解决

### 问题1：推送失败
```bash
# 如果提示身份验证错误，使用Personal Access Token
git remote set-url origin https://yourtoken@github.com/yourusername/personal-blog.git
```

### 问题2：构建失败
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题3：页面404
- 检查仓库设置中的 Pages 配置
- 确保 gh-pages 分支存在且有内容
- 等待几分钟让 GitHub 完成部署

## 🎉 完成！

现在您的个人博客已经成功部署到 GitHub Pages 了！

📱 **您的网站地址**：`https://yourusername.github.io/personal-blog`

📖 **项目仓库**：`https://github.com/yourusername/personal-blog`

🌟 **下一步**：
1. 在 README.md 中添加您的实际GitHub链接
2. 考虑配置自定义域名
3. 定期更新内容并推送更新

---

💡 **提示**：GitHub Pages 免费提供静态网站托管，非常适合个人博客项目！