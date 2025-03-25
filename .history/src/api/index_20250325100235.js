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
    getStatus: () => api.get('/api/crawler/status'),

    // 启动爬虫
    startCrawler: (config) => api.post('/api/crawler/start', config),

    // 通过文件导入URL启动爬虫
    startCrawlerWithFile: (config) => api.post('/api/crawler/start-with-file', config),

    // 停止爬虫
    stopCrawler: () => api.post('/api/crawler/stop'),

    // 获取爬取统计
    getStats: () => api.get('/api/crawler/stats'),

    // 获取子站点列表
    getSubdomains: () => api.get('/api/crawler/subdomains'),

    // 单页爬取
    customCrawl: (formData) => api.post('/api/crawler/custom', formData),

    // 获取单页爬取结果
    getCustomCrawlResult: (crawlId) => api.get(`/api/crawler/custom/${crawlId}`),
    
    // 获取爬虫高级配置 
    getAdvancedConfig: () => api.get('/api/crawler/advanced-config'),
    
    // 保存爬虫高级配置
    saveAdvancedConfig: (config) => api.post('/api/crawler/advanced-config', config)
};

// 文章相关API
export const articleAPI = {
    // 获取文章列表
    getArticles: (params) => api.get('/api/articles', { params }),

    // 获取文章详情
    getArticleDetail: (id) => api.get(`/api/article/${id}`),
};

// 数据清洗相关API
export const cleaningAPI = {
    // 获取清洗配置
    getConfig: () => api.get('/api/cleaning/config'),

    // 保存清洗配置
    saveConfig: (config) => api.post('/api/cleaning/config', config),

    // 执行数据清洗
    runCleaning: () => api.post('/api/cleaning/run'),
};

// 数据导出相关API
export const exportAPI = {
    // 导出数据
    exportData: (params) => api.get('/api/export', { params }),
};

export default api;