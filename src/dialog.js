const express = require('express');
const chatHistory = require('./history.js');
const router = express.Router();

// 添加JSON解析中间件
router.use(express.json());

// 清空聊天历史记录
router.post('/api/dialog/clear', async (req, res) => {
    try {
        const uid = req.body.uid;
        if (!uid) {
            return res.status(400).send('缺少uid参数');
        }

        // 初始化历史记录系统
        await chatHistory.initialize();
        
        // 清空历史记录
        const result = await chatHistory.clearHistory(uid);
        if (result) {
            res.json({ success: true });
        } else {
            res.status(500).send('清空历史记录失败');
        }
    } catch (error) {
        console.error('清空历史记录失败:', error);
        res.status(500).send('清空历史记录失败');
    }
});

// 获取聊天历史记录
router.get('/api/dialog', async (req, res) => {
    try {
        const uid = req.query.uid;
        if (!uid) {
            return res.status(400).send('缺少uid参数');
        }

        // 初始化历史记录系统
        await chatHistory.initialize();
        
        // 获取历史记录
        const history = await chatHistory.getHistory(uid);
        res.json(history);
    } catch (error) {
        console.error('获取历史记录失败:', error);
        res.status(500).send('获取历史记录失败');
    }
});

module.exports = router;