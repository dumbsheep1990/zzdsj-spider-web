import React, { createContext, useState, useContext, useEffect } from 'react';
const GlobalSettingsContext = createContext();

// 初始化全局设置
const defaultSettings = {
    llmSettings: {
        activeProvider: 'cloud', // cloud, ollama, custom
        cloud: {
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
            model: 'llama2',
            api_url: 'http://localhost:11434',
            models: [
                { label: 'Llama 2', value: 'llama2' },
                { label: 'Mistral', value: 'mistral' },
                { label: 'Phi-2', value: 'phi' }
            ]
        },
        custom: {
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
        vectorDB: false
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
            // 模拟API检查
            // 实际应用中应该是真实的API调用
            const mockStatus = {
                openai: Math.random() > 0.2 ? 'connected' : 'disconnected',
                ollama: Math.random() > 0.2 ? 'connected' : 'error',
                backend: 'connected',
                vectorDB: Math.random() > 0.2 ? 'connected' : 'error'
            };

            setSettings(prevSettings => ({
                ...prevSettings,
                apiStatus: mockStatus
            }));

            return mockStatus;
        } catch (error) {
            console.error('检查API状态出错:', error);
            return settings.apiStatus;
        }
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
        checkAPIStatus
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