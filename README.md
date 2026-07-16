# SyncAgent Web

智能体配置云同步 - 前端网站

## 本地开发

```bash
# 启动本地服务器（需要 Python）
python3 -m http.server 8080

# 或使用 Node.js
npx serve .
```

访问 http://localhost:8080/public/

## 部署到 Vercel

### 方法1：通过 Git（推荐）

```bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/syncagent-web.git
git push -u origin main

# 2. 导入到 Vercel
访问 https://vercel.com
点击 "Import Project"
选择你的 GitHub 仓库
点击 "Deploy"
```

### 方法2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 项目结构

```
syncagent-web/
├── public/
│   ├── index.html          # 首页
│   ├── setup.html          # 注册/安装页面
│   └── docs.html           # 文档
├── styles/
│   └── main.css            # 样式
├── scripts/
│   └── app.js              # 前端逻辑
├── vercel.json             # Vercel 配置
└── README.md               # 本文件
```

## 配置说明

### API 端点

在 `scripts/app.js` 中配置后端 API 地址：

```javascript
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : 'https://your-api-domain.railway.app';
```

部署后记得修改为你的实际 API 域名。

## 自定义域名

在 Vercel Dashboard：
1. 进入项目设置
2. 点击 "Domains"
3. 添加你的域名（如 syncagent.io）
4. 按提示配置 DNS 记录

## 注意事项

- 所有 HTML 文件必须在 `public/` 目录下
- Vercel 会自动配置 HTTPS
- 部署后域名：https://your-project.vercel.app

## License

MIT
