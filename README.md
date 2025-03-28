# AI聊天服务器

一个基于Express框架的Deep-Seek-R1聊天应用服务器，支持多用户聊天、聊天附件文件上传和历史记录管理。

## 技术栈

- Node.js
- Express.js
- Axios
- Multer（文件上传）
- Marked.js（Markdown渲染）

## 主要功能

### 1. AI聊天
- 支持多用户独立会话
- 实时流式响应
- Markdown格式支持
- AI思考过程展示

### 2. 文件管理
- 文件上传功能
- 上传历史记录

### 3. 对话管理
- 对话历史记录保存
- 历史记录清空功能
- 用户会话隔离

## 使用说明

1. 安装依赖
```bash
npm install
```

2. 启动服务器
```bash
npm run dev
```

3. 访问服务
- 聊天界面：http://localhost:3000/
  含历史记录，角色设定，携带附件
- 上传界面：http://localhost:3000/upload
    使用 nomic-embed-text:latest 模型对文本进行向量化处理。
    可修改成你本地自己的模型，暂未开发完

- 测试模型用（不包含历史记录，系统设定等）：http://localhost:3000/pure
发送类似下面的json数据
[ { "role": "system", "content": "#### 定位\n- 智能助手名称 ：新闻分类专家\n- 主要任务 ：对输入的新闻文本进行自动分类，识别其所属的新闻种类。\n\n#### 能力\n- 文本分析 ：能够准确分析新闻文本的内容和结构。\n- 分类识别 ：根据分析结果，将新闻文本分类到预定义的种类中。\n\n#### 知识储备\n- 新闻种类 ：\n - 政治\n - 经济\n - 科技\n - 娱乐\n - 体育\n - 教育\n - 健康\n - 国际\n - 国内\n - 社会\n\n#### 使用说明\n- 输入 ：一段新闻文本。\n- 输出 ：只输出新闻文本所属的种类，不需要额外解释。" }, { "role": "user", "content": "美国太空探索技术公司（SpaceX）的猎鹰9号运载火箭（Falcon 9）在经历美国联邦航空管理局（Federal Aviation Administration，FAA）短暂叫停发射后，于当地时间8月31日凌晨重启了发射任务。" } ]
进行模型api测试

## 项目结构

```
├── app.js          # 应用入口文件
├── config.js       # 配置文件
├── src/
│   ├── chat.js     # AI聊天对话功能
│   ├── dialog.js   # 对话历史管理
│   ├── pureChat.js # 纯AI对话功能
│   ├── upload.js   # 文件上传功能
│   └── templates/  # 页面模板
├── history/        # 历史记录存储
└── upload/         # 上传文件存储
```