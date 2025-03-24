import React, { createContext, useState, useContext, useEffect } from 'react';

// 创建全局设置上下文
const GlobalSettingsContext = createContext();

// 初始化全局设置
const defaultSettings = {
    llmSettings: {
        activeProvider: 'cloud', // cloud, ollama, custom
        cloud: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            apiKey: '',
            apiBase: '',
            models: [
                { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                { label: 'GPT-4', value: 'gpt-4' },
                { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
            ]
        },
        ollama: {
            model: 'llama2',
            apiUrl: 'http://localhost:11434',
            models: [
                { label: 'Llama 2', value: 'llama2' },
                { label: 'Mistral', value: 'mistral' },
                { label: 'Phi-2', value: 'phi' }
            ]
        },
        custom: {
            model: '',
            apiUrl: '',
            apiKey: ''
        }
    },
    apiKeys: {
        openai: '',
        anthropic: '',
        custom: ''
    },
    apiStatus: {
        cloud: 'unknown',
        ollama: 'unknown',
        custom: 'unknown'
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

    // 获取当前活跃的LLM配置
    const getActiveLLMConfig = () => {
        const { activeProvider } = settings.llmSettings;
        return {
            provider: activeProvider,
            config: settings.llmSettings[activeProvider]
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

    // 将值和更新函数提供给上下文
    const value = {
        settings,
        updateLLMConfig,
        setActiveLLMProvider,
        getActiveLLMConfig,
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