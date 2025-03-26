import { request } from './request';

// 向量化API
export const vectorAPI = {
    // 获取向量化配置
    getConfig: async () => {
        return request('/api/vector/config', {
            method: 'GET'
        });
    },

    // 保存向量化配置
    saveConfig: async (params) => {
        return request('/api/vector/config', {
            method: 'POST',
            data: params
        });
    },

    // 测试向量化服务连接
    testConnection: async (params) => {
        return request('/api/vector/test', {
            method: 'POST',
            data: params
        });
    },

    // 获取向量化统计信息
    getStats: async () => {
        return request('/api/vector/stats', {
            method: 'GET'
        });
    },

    // 重建向量索引
    rebuildIndex: async (params) => {
        return request('/api/vector/rebuild', {
            method: 'POST',
            data: params
        });
    },

    // 获取重建进度
    getProgress: async (taskId) => {
        return request(`/api/vector/progress/${taskId}`, {
            method: 'GET'
        });
    },

    // 批量向量化
    batchVectorize: async (params) => {
        return request('/api/vector/batch', {
            method: 'POST',
            data: params
        });
    },

    // 获取批量向量化进度
    getBatchProgress: async (taskId) => {
        return request(`/api/vector/batch/${taskId}/progress`, {
            method: 'GET'
        });
    },

    // 获取批量向量化结果
    getBatchResults: async (taskId) => {
        return request(`/api/vector/batch/${taskId}/results`, {
            method: 'GET'
        });
    },

    // 向量相似度搜索
    similaritySearch: async (params) => {
        return request('/api/vector/search', {
            method: 'POST',
            data: params
        });
    },

    // 获取向量化历史记录
    getHistory: async (params) => {
        return request('/api/vector/history', {
            method: 'GET',
            params
        });
    },

    // 删除向量化记录
    deleteRecord: async (recordId) => {
        return request(`/api/vector/record/${recordId}`, {
            method: 'DELETE'
        });
    },

    // 导出向量化结果
    exportResults: async (params) => {
        return request('/api/vector/export', {
            method: 'POST',
            data: params,
            responseType: 'blob'
        });
    },

    // 获取向量化模型列表
    getModels: async () => {
        return request('/api/vector/models', {
            method: 'GET'
        });
    },

    // 获取向量化模板列表
    getTemplates: async () => {
        return request('/api/vector/templates', {
            method: 'GET'
        });
    },

    // 保存向量化模板
    saveTemplate: async (params) => {
        return request('/api/vector/template', {
            method: 'POST',
            data: params
        });
    },

    // 删除向量化模板
    deleteTemplate: async (templateId) => {
        return request(`/api/vector/template/${templateId}`, {
            method: 'DELETE'
        });
    }
}; 