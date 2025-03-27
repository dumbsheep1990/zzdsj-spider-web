import React, { createContext, useState, useContext, useEffect } from 'react';
import { llmAPI, vectorAPI, systemAPI } from '../api';
const GlobalSettingsContext = createContext();

// 初始化全局设置
const defaultSettings = {
    llmSettings: {
        useServerConfig: false, // 是否使用服务器配置
        serverConfig: null, // 服务器配置
        activeProvider: 'cloud', // cloud, ollama, custom
        cloud: {
            enabled: true, // 默认启用云服务
            model: 'deepseek-7b',
            provider: 'deepseek',
            api_key: '',
            api_base: '',
            models: [
                { label: 'Deepseek-7B', value: 'deepseek-7b' },
                { label: 'Deepseek-67B', value: 'deepseek-67b' },
                { label: '豆包-7B', value: 'doubao-7b' },
                { label: '豆包-13B', value: 'doubao-13b' },
                { label: '通义千问-7B', value: 'qianwen-7b' },
                { label: '通义千问-72B', value: 'qianwen-72b' },
                { label: 'GLM-4', value: 'glm-4' },
                { label: 'GLM-3-Turbo', value: 'glm-3-turbo' }
            ]
        },
        ollama: {
            enabled: false, // 默认禁用Ollama
            model: 'llama2',
            api_url: 'http://localhost:11434',
            models: [
                { label: 'Llama 2', value: 'llama2' },
                { label: 'Mistral', value: 'mistral' },
                { label: 'Phi-2', value: 'phi' }
            ]
        },
        custom: {
            enabled: false, // 默认禁用自定义API
            model: '',
            api_url: '',
            api_key: '',
        },
        advanced: {
            temperature: 0.7,
            max_tokens: 1000,
            timeout: 30,
            retry_count: 3
        }
    },
    vectorSettings: {
        activeProvider: 'ollama', // ollama, custom
        ollama: {
            model: 'llama2',
            apiUrl: 'http://localhost:11434',
            models: [
                { label: 'Llama 2', value: 'llama2', dimension: 4096 },
                { label: 'Mistral', value: 'mistral', dimension: 4096 },
                { label: 'Phi-2', value: 'phi', dimension: 2560 }
            ]
        },
        custom: {
            model: '',
            apiUrl: '',
            apiKey: '',
            dimension: 1536
        }
    },
    vectorDB: {
        type: 'chroma', // chroma, milvus, qdrant
        chroma: {
            host: 'localhost',
            port: 8000,
            collection: 'default'
        },
        milvus: {
            host: 'localhost',
            port: 19530,
            collection: 'default'
        },
        qdrant: {
            host: 'localhost',
            port: 6333,
            collection: 'default'
        }
    },
    apiKeys: {
        deepseek: '',
        doubao: '',
        aliyun: '',
        zhipu: '',
        openai: '',
        anthropic: '',
        google: '',
        custom: ''
    },
    apiStatus: {
        deepseek: false,
        doubao: false,
        aliyun: false,
        zhipu: false,
        openai: false,
        anthropic: false,
        google: false,
        custom: false,
        ollama: false,
        vectorDB: false,
        backend: false,
        crawler: false,
        resource: false
    }
};

// 全局设置提供者组件
export function GlobalSettingsProvider({ children }) {
    // 从本地存储中加载设置
    const loadSettings = () => {
        try {
            const savedSettings = localStorage.getItem('globalSettings');
            return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        } catch (error) {
            console.error('加载设置出错:', error);
            return defaultSettings;
        }
    };

    const [settings, setSettings] = useState(loadSettings);

    // 保存设置到本地存储
    useEffect(() => {
        try {
            // 不存储敏感信息如API密钥
            const settingsToSave = {
                ...settings,
                apiKeys: {} // 不存储API密钥
            };
            localStorage.setItem('globalSettings', JSON.stringify(settingsToSave));
        } catch (error) {
            console.error('保存设置出错:', error);
        }
    }, [settings]);

    // 更新LLM配置
    const updateLLMConfig = (provider, config) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                [provider]: {
                    ...prevSettings.llmSettings[provider],
                    ...config
                }
            }
        }));
    };

    // 更新向量化配置
    const updateVectorConfig = (provider, config) => {
        setSettings(prev => ({
            ...prev,
            vectorSettings: {
                ...prev.vectorSettings,
                [provider]: {
                    ...prev.vectorSettings[provider],
                    ...config
                }
            }
        }));
    };

    // 更新向量数据库配置
    const updateVectorDBConfig = (type, config) => {
        setSettings(prev => ({
            ...prev,
            vectorDB: {
                ...prev.vectorDB,
                type,
                [type]: {
                    ...prev.vectorDB[type],
                    ...config
                }
            }
        }));
    };

    // 设置活跃的LLM提供商
    const setActiveLLMProvider = (provider) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                activeProvider: provider
            }
        }));
    };

    // 设置活跃的向量化提供商
    const setActiveVectorProvider = (provider) => {
        setSettings(prev => ({
            ...prev,
            vectorSettings: {
                ...prev.vectorSettings,
                activeProvider: provider
            }
        }));
    };

    // 获取当前活跃的LLM配置
    const getActiveLLMConfig = () => {
        const { activeProvider } = settings.llmSettings;
        return {
            provider: activeProvider,
            config: settings.llmSettings[activeProvider]
        };
    };

    // 获取当前活跃的向量化配置
    const getActiveVectorConfig = () => {
        const { activeProvider } = settings.vectorSettings;
        return {
            provider: activeProvider,
            config: settings.vectorSettings[activeProvider]
        };
    };

    // 检查API状态
    const checkAPIStatus = async () => {
        try {
            // 获取系统状态
            const systemStatus = await systemAPI.getStatus();
            
            // 初始化API状态对象
            let newStatus = {
                ...settings.apiStatus,
                // 先根据系统状态判断
                backend: systemStatus.data.status === 'running' ? 'connected' : 'disconnected',
                ollama: systemStatus.data.services.ollama ? 'connected' : 'disconnected'
            };
            
            // 添加对爬虫服务心跳的检查
            try {
                const { crawlerAPI } = await import('../api');
                const heartbeatRes = await crawlerAPI.heartbeat();
                console.log('爬虫服务心跳检测响应:', heartbeatRes.data);
                if (heartbeatRes.data && heartbeatRes.data.status === 'online') {
                    // 如果心跳正常，更新爬虫状态为已连接
                    newStatus.crawler = 'connected';
                    // 同时backend也标记为已连接
                    newStatus.backend = 'connected';
                } else {
                    newStatus.crawler = 'not_connected';
                }
            } catch (error) {
                console.error('爬虫服务心跳检测失败:', error);
                // 心跳检测失败，爬虫状态设为未连接
                newStatus.crawler = 'not_connected';
            }
            
            // 添加对资源监控服务的检查
            try {
                const resourceUsage = await systemAPI.getResourceUsage();
                console.log('【DEBUG】资源监控检测响应:', resourceUsage.data);
                if (resourceUsage.data) {
                    // 如果能获取资源信息，标记为已连接
                    newStatus.resource = 'connected';
                    
                    // 校验和转换资源使用数据的格式
                    const resources = resourceUsage.data;
                    if (typeof resources === 'object') {
                        // 预处理资源数据，确保后续组件能正确显示
                        try {
                            // 若存在嵌套的cpu、memory、disk对象，提取其percent属性
                            if (resources.cpu && typeof resources.cpu === 'object' && resources.cpu.percent !== undefined) {
                                resources.cpu_percent = resources.cpu.percent;
                            }
                            
                            if (resources.memory && typeof resources.memory === 'object' && resources.memory.percent !== undefined) {
                                resources.memory_percent = resources.memory.percent;
                            }
                            
                            if (resources.disk && typeof resources.disk === 'object' && resources.disk.percent !== undefined) {
                                resources.disk_percent = resources.disk.percent;
                            }
                        } catch (err) {
                            console.error('预处理资源数据时出错:', err);
                        }
                    }
                } else {
                    newStatus.resource = 'not_connected';
                }
            } catch (error) {
                console.error('资源监控检测失败:', error);
                // 检测失败，状态设为未连接
                newStatus.resource = 'not_connected';
            }
            
            // 检查LLM服务配置和状态
            const providers = ['cloud', 'ollama', 'custom'];
            for (const provider of providers) {
                const config = settings.llmSettings?.[provider];
                
                // 检查服务是否启用
                if (!config?.enabled) {
                    newStatus[provider] = 'disabled';
                    continue;
                }
                
                // 检查配置是否完整
                if (!isConfigComplete(provider, config)) {
                    newStatus[provider] = 'not_configured';
                    continue;
                }
                
                // 测试已启用且配置完整的服务连接
                try {
                    const llmStatus = await llmAPI.testConnection({
                        provider: provider,
                        config: config
                    });
                    newStatus[provider] = llmStatus.data.connected ? 'connected' : 'disconnected';
                } catch (error) {
                    console.error(`测试${provider}连接失败:`, error);
                    newStatus[provider] = 'error';
                }
            }
            
            // 获取向量化服务状态
            try {
                const vectorStatus = await vectorAPI.testConnection(settings.vectorSettings);
                newStatus.vector = vectorStatus.data.connected ? 'connected' : 'disconnected';
            } catch (error) {
                console.error('测试向量服务连接失败:', error);
                newStatus.vector = 'error';
            }
            
            // 更新API状态
            setSettings(prev => ({
                ...prev,
                apiStatus: newStatus
            }));
            
            return newStatus;
        } catch (error) {
            console.error('检查API状态失败:', error);
            throw error;
        }
    };
    
    // 检查配置是否完整
    const isConfigComplete = (provider, config) => {
        if (!config) return false;
        
        switch (provider) {
            case 'cloud':
                return !!config.model && !!config.provider && !!config.apiKey;
            case 'ollama':
                return !!config.model && !!config.apiUrl;
            case 'custom':
                return !!config.model && !!config.apiUrl;
            default:
                return false;
        }
    };

    // 加载服务器LLM配置
    const loadServerLLMConfig = async () => {
        try {
            const response = await llmAPI.getServerConfigs();
            if (response.data && response.data.status === 'success') {
                setSettings(prev => ({
                    ...prev,
                    llmSettings: {
                        ...prev.llmSettings,
                        serverConfig: response.data
                    }
                }));
                console.log('加载服务器LLM配置成功', response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('加载服务器LLM配置失败:', error);
            return false;
        }
    };
    
    // 设置是否使用服务器配置
    const setUseServerConfig = async (useServer) => {
        // 如果需要使用服务器配置，需要先加载服务器配置
        if (useServer && !settings.llmSettings.serverConfig) {
            const success = await loadServerLLMConfig();
            if (!success) {
                // 加载失败，不更新状态
                return false;
            }
        }
        
        setSettings(prev => ({
            ...prev,
            llmSettings: {
                ...prev.llmSettings,
                useServerConfig: useServer
            }
        }));
        return true;
    };

    // 将值和更新函数提供给上下文
    const value = {
        settings,
        updateLLMConfig,
        updateVectorConfig,
        updateVectorDBConfig,
        setActiveLLMProvider,
        setActiveVectorProvider,
        getActiveLLMConfig,
        getActiveVectorConfig,
        checkAPIStatus,
        loadServerLLMConfig,
        setUseServerConfig
    };

    return (
        <GlobalSettingsContext.Provider value={value}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}

// 自定义Hook，用于访问全局设置
export function useGlobalSettings() {
    const context = useContext(GlobalSettingsContext);
    if (!context) {
        throw new Error('useGlobalSettings必须在GlobalSettingsProvider内部使用');
    }
    return context;
}