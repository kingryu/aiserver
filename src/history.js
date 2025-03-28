const fs = require('fs').promises;
const path = require('path');

class ChatHistory {
    constructor() {
        this.historyDir = path.join(__dirname, '../history');
    }

    getHistoryFilePath(uid) {
        return path.join(this.historyDir, `history_${uid}.json`);
    }

    async initialize() {
        try {
            // 确保history目录存在
            await fs.mkdir(this.historyDir, { recursive: true });
        } catch (error) {
            console.error('初始化历史记录失败:', error);
            throw error;
        }
    }

    async getHistory(uid) {
        try {
            const historyFile = this.getHistoryFilePath(uid);
            try {
                const data = await fs.readFile(historyFile, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                // 如果文件不存在，返回空数组并创建文件
                if (error.code === 'ENOENT') {
                    await fs.writeFile(historyFile, JSON.stringify([]));
                    return [];
                }
                throw error;
            }
        } catch (error) {
            console.error('读取历史记录失败:', error);
            return [];
        }
    }

    async addHistory(uid, message, role = 'user') {
        try {
            const history = await this.getHistory(uid);
            const newEntry = {
                role: role,
                content: message
            };
            history.push(newEntry);
            await fs.writeFile(this.getHistoryFilePath(uid), JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('添加历史记录失败:', error);
            return false;
        }
    }

    async clearHistory(uid) {
        try {
            await fs.writeFile(this.getHistoryFilePath(uid), JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('清空历史记录失败:', error);
            return false;
        }
    }
}

module.exports = new ChatHistory();