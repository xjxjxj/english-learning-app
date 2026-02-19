# 🎓 英语学习助手 (English Learning Assistant)

一个功能完善的英语学习应用，帮助你记录单词、翻译句子、学习语法，并通过数据可视化追踪学习进度。

## ✨ 功能特点

### 📚 核心功能
- **单词管理**: 记录单词、音标、释义、例句，支持难度分级和收藏
- **句子翻译**: 保存中英对照句子，支持多种类型（日常、商务、学术等）
- **语法结构**: 系统化学习语法，包含结构说明、例句、常见错误和学习技巧
- **复习系统**: 智能复习提醒，根据复习次数和时间自动推荐复习内容
- **数据统计**: 可视化展示学习进度、难度分布、学习趋势等

### 🎨 界面特性
- 现代化响应式设计，支持桌面和移动设备
- 直观的数据可视化（Chart.js）
- 流畅的用户交互体验
- 支持暗黑/亮色主题

### 🔧 技术栈
- **后端**: Django 4.2 + Django REST Framework
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **可视化**: Chart.js
- **部署**: Docker + Render

## 🚀 快速开始

### 方式一：本地运行

#### 1. 克隆项目
```bash
git clone https://github.com/yourusername/english-learning-app.git
cd english-learning-app
```

#### 2. 创建虚拟环境
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 3. 安装依赖
```bash
pip install -r requirements.txt
```

#### 4. 运行数据库迁移
```bash
python manage.py migrate
```

#### 5. 创建管理员账号（可选）
```bash
python manage.py createsuperuser
```

#### 6. 启动开发服务器
```bash
python manage.py runserver
```

访问 http://127.0.0.1:8000/ 开始使用！

### 方式二：Docker 运行

#### 1. 使用 Docker Compose
```bash
docker-compose up -d
```

#### 2. 访问应用
- 应用: http://localhost:8000
- 管理员后台: http://localhost:8000/admin

### 方式三：部署到 Render（免费在线托管）

#### 1. Fork 或推送代码到 GitHub

#### 2. 在 Render 创建服务
- 登录 [Render](https://render.com)
- 点击 "New +" → "Web Service"
- 连接你的 GitHub 仓库
- 选择 "Python" 环境

#### 3. 配置环境变量
```
PYTHON_VERSION: 3.11.0
DEBUG: False
SECRET_KEY: (自动生成)
DATABASE_URL: (使用 Render PostgreSQL)
ALLOWED_HOSTS: .onrender.com
```

#### 4. 部署
Render 会自动检测 `render.yaml` 文件并部署应用。

## 📱 使用指南

### 仪表盘
- 查看学习数据统计
- 快速添加单词/句子/语法
- 查看最近学习活动
- 显示连续学习天数

### 单词管理
- 添加单词：输入单词、音标、释义、例句
- 难度分级：简单、中等、困难
- 收藏功能：标记重点单词
- 复习追踪：记录复习次数和日期

### 句子翻译
- 保存中英对照句子
- 支持多种类型：日常用语、商务英语、学术英语、俚语、名言
- 标注关键词和语法要点
- 收藏常用句子

### 语法结构
- 系统化学习语法
- 包含结构说明和详细解释
- 提供例句和用法说明
- 标记掌握状态
- 记录常见错误和学习技巧

### 复习中心
- 自动推荐需要复习的内容
- 按类型筛选（单词/句子/语法）
- 一键标记复习完成
- 复习记录追踪

### 数据统计
- 单词难度分布图
- 句子类型分布图
- 语法难度分布图
- 最近7天学习趋势

## 📊 API 接口

### 单词接口
```
GET    /api/words/              # 获取单词列表
POST   /api/words/              # 创建单词
GET    /api/words/{id}/         # 获取单词详情
PUT    /api/words/{id}/         # 更新单词
DELETE /api/words/{id}/         # 删除单词
POST   /api/words/{id}/review/  # 标记复习
POST   /api/words/{id}/toggle_favorite/  # 切换收藏
```

### 句子接口
```
GET    /api/sentences/          # 获取句子列表
POST   /api/sentences/          # 创建句子
GET    /api/sentences/{id}/     # 获取句子详情
PUT    /api/sentences/{id}/     # 更新句子
DELETE /api/sentences/{id}/     # 删除句子
POST   /api/sentences/{id}/review/
POST   /api/sentences/{id}/toggle_favorite/
```

### 语法接口
```
GET    /api/grammar/            # 获取语法列表
POST   /api/grammar/            # 创建语法
GET    /api/grammar/{id}/       # 获取语法详情
PUT    /api/grammar/{id}/       # 更新语法
DELETE /api/grammar/{id}/       # 删除语法
POST   /api/grammar/{id}/review/
POST   /api/grammar/{id}/toggle_mastered/
```

### 其他接口
```
GET    /api/dashboard/          # 仪表盘数据
GET    /api/stats/              # 统计数据
GET    /api/review/             # 待复习列表
GET    /api/search/?q=keyword   # 搜索
```

## 🛠️ 开发计划

- [x] 基础 CRUD 功能
- [x] 数据可视化
- [x] 复习系统
- [x] 搜索功能
- [ ] 用户认证系统
- [ ] 数据导入/导出 (Excel/CSV)
- [ ] 语音朗读功能
- [ ] 单词卡片模式
- [ ] 移动端 App
- [ ] 学习提醒通知

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Created with ❤️ for English learners

---

**Enjoy Learning English! 🎓📚**
