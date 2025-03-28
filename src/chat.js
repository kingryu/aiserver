const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { OLLAMA_SERVER, AI_MODEL, ROLE_DESC,temperature } = require('../config.js');
const chatHistory = require('./history.js');

const router = express.Router();

// 提供一个 HTML 页面用于和ai聊天，包含历史记录，系统身份设定，附件内容等
router.get('/', (req, res) => {
    const chatTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'chat.html'), 'utf8');
    res.send(chatTemplate);
});

router.post('/api/chat', express.json(), async (req, res) => {
    const userMessage = req.body.message;
    const uid = req.body.uid;

    if (!uid) {
        return res.status(400).send('缺少uid参数');
    }

    try {
        // 初始化历史记录系统
        await chatHistory.initialize();
        // 读取 input 目录中的文本作为上下文
        const inputDir = path.join(__dirname, '../upload');
        let context = '';
        fs.readdirSync(inputDir).forEach(file => {
            const filePath = path.join(inputDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            context += fileContent + '\n';
        });
        try{
            context = JSON.parse(context)
        }catch{
            console.error('context is not json')
            context = context;
        }
        const history = await chatHistory.getHistory(uid)
        // 保存用户消息到历史记录
        await chatHistory.addHistory(uid, userMessage, 'user');
        // 构建发送给 Ollama 的请求
        const ollamaUrl = OLLAMA_SERVER + '/api/generate';
        
        let prompt = [
            {
                role: "system",
                content: ROLE_DESC, 
                attachments: context, 
                temperature: temperature
            }];
        prompt = prompt.concat(history)
        const userQuestion = {
            role: "user",
            content: userMessage
        }
        prompt.push(userQuestion)
        prompt = JSON.stringify(prompt),
        
    //    let prompt = '附件资料：'+JSON.stringify(context)+'。\n'+ ROLE_DESC + '。\n 问题：' + userMessage;
        console.log('prompt:', prompt);
        const ollamaRequest = {
            model: AI_MODEL,
            prompt: prompt,
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
            // 在响应结束时，获取完整的AI回复并保存非思考部分到历史记录
            const saveRes = aiResponse.split('</think>')[1]
            await chatHistory.addHistory(uid, saveRes, 'assistant');
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