const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { OLLAMA_SERVER, AI_MODEL } = require('../config.js');

const router = express.Router();

// 不含历史记录及系统身份设定的纯单次聊天页面,方便测试ai功能
router.get('/pure', (req, res) => {
    const chatTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'pureChat.html'), 'utf8');
    res.send(chatTemplate);
});

router.post('/api/pureChat', express.json(), async (req, res) => {
    const userMessage = req.body.message;

    try {
        // 构建发送给 Ollama 的请求
        const ollamaUrl = OLLAMA_SERVER + '/api/generate';

        console.log('prompt:', userMessage);
        const ollamaRequest = {
            model: AI_MODEL,
            prompt: userMessage,
            stream: true
        };
        // 发起请求到 Ollama 并以流的方式返回结果
        const ollamaResponse = await axios.post(ollamaUrl, ollamaRequest, { responseType: 'stream' });
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 用于累积AI的回复
        let aiResponse = '';
        
        ollamaResponse.data.on('data', (chunk) => {
            try {
                const chunkStr = chunk.toString().trim();
                if (!chunkStr) return;
                
                // 尝试解析JSON数据
                const data = JSON.parse(chunkStr);
                if (data.response) {
                    // 累积AI的回复
                    aiResponse += data.response;
                    res.write(`data: ${JSON.stringify({ message: data.response })}
`);
                }
            } catch (error) {
                console.error('解析 Ollama 响应时出错:', error, '\n原始数据:', chunk.toString());
                // 继续处理下一个数据块，不中断流程
            }
        });

        ollamaResponse.data.on('end', async () => {
            res.end();
        });
        
        ollamaResponse.data.on('error', (error) => {
            console.error('与 Ollama 通信时出错:', error);
            res.status(500).send('与 Ollama 通信时出错');
        });
    } catch (error) {
        console.error('处理请求时出错:', error);
        res.status(500).send('处理请求时出错');
    }
});

module.exports = router;