import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:8000';

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30秒超时
    headers: {
        'Content-Type': 'application/json',
    },
});

// 爬虫相关API
export const crawlerAPI = {
    // 获取爬虫状态
    getStatus: () => api.get('/crawler/status'),

    // 启动爬虫
    startCrawler: (config) => api.post('/crawler/start', config),

    // 停止爬虫
    stopCrawler: () => api.post('/crawler/stop'),

    // 获取爬取统计
    getStats: () => api.get('/crawler/stats'),

    // 获取子站点列表
    getSubdomains: () => api.get('/subdomains'),

    // 单页爬取
    customCrawl: (formData) => api.post('/crawler/custom', formData),

    // 获取单页爬取结果
    getCustomCrawlResult: (crawlId) => api.get(`/custom-crawl/${crawlId}`),
};

// 文章相关API
export const articleAPI = {
    // 获取文章列表
    getArticles: (params) => api.get('/articles', { params }),

    // 获取文章详情
    getArticleDetail: (id) => api.get(`/article/${id}`),
};

// 数据清洗相关API
export const cleaningAPI = {
    // 获取清洗配置
    getConfig: () => api.get('/cleaning/config'),

    // 保存清洗配置
    saveConfig: (config) => api.post('/cleaning/config', config),

    // 执行数据清洗
    runCleaning: () => api.post('/cleaning/run'),
};

// 数据导出相关API
export const exportAPI = {
    // 导出数据
    exportData: (params) => api.get('/export', { params }),
};

export default api;