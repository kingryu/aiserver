const express = require('express');
const uploadRouter = require('./src/upload.js');
const chatRouter = require('./src/chat.js');
const agentChatRouter = require('./src/pureChat.js');
const dialogRouter = require('./src/dialog.js');

const app = express();
const port = 3000;

// 使用上传路由
app.use('/', uploadRouter);

// 使用聊天路由
app.use('/', chatRouter);
app.use('/', agentChatRouter);

// 使用对话历史路由
app.use('/', dialogRouter);

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});