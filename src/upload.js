const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { OLLAMA_SERVER } = require('../config.js');

const router = express.Router();

// 配置 multer 以处理文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'upload');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 处理文件名编码，解决乱码问题
        const originalFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, originalFilename);
    }
});

const upload = multer({ storage: storage });

// 提供一个 HTML 页面用于文件上传
router.get('/upload', (req, res) => {
    const uploadTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'upload.html'), 'utf8');
    res.send(uploadTemplate);
});

// 处理文件上传
router.post('/api/upload', upload.single('textFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('未选择文件');
    }
    try {
        // 读取上传的文本文件内容
        const text = fs.readFileSync(req.file.path, 'utf8');

        const ollamaUrl = OLLAMA_SERVER + '/api/embeddings';
        // 调用 Ollama API 生成嵌入向量
        const response = await axios.post(ollamaUrl, {
            model: 'nomic-embed-text:latest',
            prompt: text
        });

        const embedding = response.data.embedding;

        // 保存嵌入向量到输出文件
        const outputDir = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const outputPath = path.join(outputDir, req.file.originalname + '.embedding.json');
        fs.writeFileSync(outputPath, JSON.stringify(embedding, null, 2));

        res.send('文件上传成功，并已生成嵌入向量');
    } catch (error) {
        console.error('处理文件时出错:', error);
        res.status(500).send('处理文件时出错');
    }
});

module.exports = router;