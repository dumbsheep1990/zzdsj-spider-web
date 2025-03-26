import { request } from './request';

// AI提取API
export const aiAPI = {
    // 从URL提取内容
    extractFromUrl: async (params) => {
        return request('/api/ai/extract/url', {
            method: 'POST',
            data: params
        });
    },

    // 从HTML提取内容
    extractFromHtml: async (params) => {
        return request('/api/ai/extract/html', {
            method: 'POST',
            data: params
        });
    },

    // 获取提取历史
    getExtractHistory: async (params) => {
        return request('/api/ai/extract/history', {
            method: 'GET',
            params
        });
    },

    // 保存提取模板
    saveExtractTemplate: async (params) => {
        return request('/api/ai/extract/template', {
            method: 'POST',
            data: params
        });
    },

    // 获取提取模板列表
    getExtractTemplates: async () => {
        return request('/api/ai/extract/templates', {
            method: 'GET'
        });
    },

    // 删除提取模板
    deleteExtractTemplate: async (templateId) => {
        return request(`/api/ai/extract/template/${templateId}`, {
            method: 'DELETE'
        });
    },

    // 批量提取
    batchExtract: async (params) => {
        return request('/api/ai/extract/batch', {
            method: 'POST',
            data: params
        });
    },

    // 获取批量提取进度
    getBatchProgress: async (taskId) => {
        return request(`/api/ai/extract/batch/${taskId}/progress`, {
            method: 'GET'
        });
    },

    // 获取批量提取结果
    getBatchResults: async (taskId) => {
        return request(`/api/ai/extract/batch/${taskId}/results`, {
            method: 'GET'
        });
    },

    // 导出提取结果
    exportResults: async (params) => {
        return request('/api/ai/extract/export', {
            method: 'POST',
            data: params,
            responseType: 'blob'
        });
    }
}; 