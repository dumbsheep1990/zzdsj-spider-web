import React, { createContext, useState, useContext, useEffect } from 'react';

// 创建全局设置上下文
const GlobalSettingsContext = createContext();

// 初始化全局设置
const defaultSettings = {
    llmSettings: {
        activeProvider: 'cloud', // cloud, ollama, custom
        cloud: {
            model: 'gpt-3.5-turbo',
            provider: 'openai', // openai, anthropic
            apiBase: '',
        },
        ollama: {
            model: 'llama2',
            apiUrl: 'http://localhost:11434',
        },
        custom: {
            model: '',
            apiUrl: '',
        },
        advanced: {
            temperature: 0.7,
            maxTokens: 1000,
            timeout: 30,
            retryCount: 3
        }
    },
    apiKeys: {
        openai: '',
        anthropic: '',
        custom: ''
    },
    apiStatus: {
        openai: 'unknown',
        ollama: 'unknown',
        backend: 'unknown'
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

    // 更新LLM设置
    const updateLLMSettings = (newLLMSettings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                ...newLLMSettings
            }
        }));
    };

    // 更新LLM服务提供商设置
    const updateLLMProviderSettings = (provider, newSettings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                [provider]: {
                    ...prevSettings.llmSettings[provider],
                    ...newSettings
                }
            }
        }));
    };

    // 更新活跃的LLM提供商
    const setActiveLLMProvider = (provider) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                activeProvider: provider
            }
        }));
    };

    // 更新高级LLM设置
    const updateAdvancedLLMSettings = (newAdvancedSettings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            llmSettings: {
                ...prevSettings.llmSettings,
                advanced: {
                    ...prevSettings.llmSettings.advanced,
                    ...newAdvancedSettings
                }
            }
        }));
    };

    // 更新API密钥
    const updateAPIKey = (provider, key) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            apiKeys: {
                ...prevSettings.apiKeys,
                [provider]: key
            }
        }));
    };

    // 检查API状态
    const checkAPIStatus = async () => {
        try {
            // 模拟API检查
            // 实际应用中应该是真实的API调用
            const mockStatus = {
                openai: Math.random() > 0.2 ? 'connected' : 'disconnected',
                ollama: Math.random() > 0.2 ? 'connected' : 'error',
                backend: 'connected'
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

    // 获取当前活跃的模型信息
    const getActiveModelInfo = () => {
        const { activeProvider, cloud, ollama, custom } = settings.llmSettings;

        switch(activeProvider) {
            case 'cloud':
                return {
                    provider: cloud.provider,
                    model: cloud.model,
                    apiKey: settings.apiKeys[cloud.provider] || '',
                    apiBase: cloud.apiBase || ''
                };
            case 'ollama':
                return {
                    provider: 'ollama',
                    model: ollama.model,
                    apiUrl: ollama.apiUrl || 'http://localhost:11434'
                };
            case 'custom':
                return {
                    provider: 'custom',
                    model: custom.model,
                    apiUrl: custom.apiUrl || '',
                    apiKey: settings.apiKeys.custom || ''
                };
            default:
                return {
                    provider: 'openai',
                    model: 'gpt-3.5-turbo',
                    apiKey: settings.apiKeys.openai || ''
                };
        }
    };

    // 将值和更新函数提供给上下文
    const value = {
        settings,
        updateLLMSettings,
        updateLLMProviderSettings,
        setActiveLLMProvider,
        updateAdvancedLLMSettings,
        updateAPIKey,
        checkAPIStatus,
        getActiveModelInfo
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