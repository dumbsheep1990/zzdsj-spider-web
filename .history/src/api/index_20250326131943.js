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
    
    // 添加获取数据而不下载的方法，用于API提交功能
    getDataForExport: (params) => api.get('/api/export/data', { params })
};

// LLM服务相关API
export const llmAPI = {
    // 获取LLM配置
    getConfig: () => api.get('/api/llm/config'),
    
    // 保存LLM配置
    saveConfig: (config) => api.post('/api/llm/config', config),
    
    // 测试LLM连接
    testConnection: (config) => api.post('/api/llm/test-connection', config),
    
    // 获取可用模型列表
    getAvailableModels: (provider) => api.get(`/api/llm/models/${provider}`),
    
    // 获取模型参数配置
    getModelParams: (model) => api.get(`/api/llm/model-params/${model}`),
    
    // 保存模型参数配置
    saveModelParams: (model, params) => api.post(`/api/llm/model-params/${model}`, params)
};

// 向量化服务相关API
export const vectorAPI = {
    // 获取向量化配置
    getConfig: () => api.get('/api/vector/config'),
    
    // 保存向量化配置
    saveConfig: (config) => api.post('/api/vector/config', config),
    
    // 测试向量化服务连接
    testConnection: (config) => api.post('/api/vector/test-connection', config),
    
    // 获取向量化统计信息
    getStats: () => api.get('/api/vector/stats'),
    
    // 重建向量索引
    rebuildIndex: () => api.post('/api/vector/rebuild-index'),
    
    // 获取向量化进度
    getProgress: () => api.get('/api/vector/progress')
};

// 系统配置相关API
export const systemAPI = {
    // 获取系统配置
    getConfig: () => api.get('/api/system/config'),
    
    // 保存系统配置
    saveConfig: (config) => api.post('/api/system/config', config),
    
    // 获取系统状态
    getStatus: () => api.get('/api/system/status'),
    
    // 获取系统日志
    getLogs: (params) => api.get('/api/system/logs', { params }),
    
    // 清理系统缓存
    clearCache: () => api.post('/api/system/clear-cache'),
    
    // 获取系统资源使用情况
    getResourceUsage: () => api.get('/api/system/resource-usage'),
    
    // 重启系统服务
    restartService: (service) => api.post(`/api/system/restart/${service}`)
};

export default api;