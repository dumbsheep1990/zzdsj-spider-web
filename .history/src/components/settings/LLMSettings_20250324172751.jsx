import React from 'react';
import {
    Form,
    Select,
    Input,
    InputNumber,
    Card,
    Typography,
    Space,
    Tooltip,
    Divider
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function LLMSettings() {
    const { settings, updateLLMConfig, setActiveLLMProvider, getActiveLLMConfig, updateVectorConfig, setActiveVectorProvider, getActiveVectorConfig } = useGlobalSettings();
    const { provider: llmProvider, config: llmConfig } = getActiveLLMConfig();
    const { provider: vectorProvider, config: vectorConfig } = getActiveVectorConfig();

    // LLM提供商选项
    const llmProviderOptions = [
        { label: '云服务 LLM', value: 'cloud' },
        { label: 'Ollama 本地模型', value: 'ollama' },
        { label: '自定义 API', value: 'custom' }
    ];

    // 向量化提供商选项
    const vectorProviderOptions = [
        { label: 'Ollama 本地模型', value: 'ollama' },
        { label: '自定义 API', value: 'custom' }
    ];

    // 向量数据库选项
    const vectorDBOptions = [
        { label: 'Chroma', value: 'chroma' },
        { label: 'Milvus', value: 'milvus' },
        { label: 'Qdrant', value: 'qdrant' }
    ];

    // 获取当前选中LLM提供商的模型选项
    const getLLMModelOptions = (provider) => {
        if (!provider) return [];
        const config = settings.llmSettings[provider];
        if (!config) return [];
        
        switch(provider) {
            case 'cloud':
            case 'ollama':
                return config.models || [];
            case 'custom':
            default:
                return [];
        }
    };

    // 获取当前选中向量化提供商的模型选项
    const getVectorModelOptions = (provider) => {
        if (!provider) return [];
        return settings.vectorSettings[provider]?.models || [];
    };

    return (
        <div className="llm-settings">
            <Card title="LLM模型配置" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                    <Form.Item
                        label={
                            <span>
                                LLM提供商
                                <Tooltip title="选择用于文本生成的大语言模型提供商">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            value={llmProvider}
                            onChange={setActiveLLMProvider}
                            options={llmProviderOptions}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    {llmProvider === 'cloud' && (
                        <>
                            <Form.Item
                                label="模型"
                                name={['cloud', 'model']}
                                initialValue={llmConfig.model}
                            >
                                <Select
                                    options={getLLMModelOptions('cloud')}
                                    style={{ width: 200 }}
                                    onChange={(value) => {
                                        updateLLMConfig('cloud', { model: value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API密钥"
                                name={['cloud', 'apiKey']}
                                initialValue={llmConfig.apiKey}
                            >
                                <Input.Password
                                    onChange={(e) => {
                                        updateLLMConfig('cloud', { apiKey: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API基础URL"
                                name={['cloud', 'apiBase']}
                                initialValue={llmConfig.apiBase}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateLLMConfig('cloud', { apiBase: e.target.value });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    {llmProvider === 'ollama' && (
                        <>
                            <Form.Item
                                label="模型"
                                name={['ollama', 'model']}
                                initialValue={llmConfig.model}
                            >
                                <Select
                                    options={getLLMModelOptions('ollama')}
                                    style={{ width: 200 }}
                                    onChange={(value) => {
                                        updateLLMConfig('ollama', { model: value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API地址"
                                name={['ollama', 'apiUrl']}
                                initialValue={llmConfig.apiUrl}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateLLMConfig('ollama', { apiUrl: e.target.value });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    {llmProvider === 'custom' && (
                        <>
                            <Form.Item
                                label="模型名称"
                                name={['custom', 'model']}
                                initialValue={llmConfig.model}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateLLMConfig('custom', { model: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API地址"
                                name={['custom', 'apiUrl']}
                                initialValue={llmConfig.apiUrl}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateLLMConfig('custom', { apiUrl: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API密钥"
                                name={['custom', 'apiKey']}
                                initialValue={llmConfig.apiKey}
                            >
                                <Input.Password
                                    onChange={(e) => {
                                        updateLLMConfig('custom', { apiKey: e.target.value });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>

            <Card title="向量化配置">
                <Form layout="vertical">
                    <Form.Item
                        label={
                            <span>
                                向量化提供商
                                <Tooltip title="选择用于生成文本向量的模型提供商">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            value={vectorProvider}
                            onChange={setActiveVectorProvider}
                            options={vectorProviderOptions}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    {vectorProvider === 'ollama' && (
                        <>
                            <Form.Item
                                label="模型"
                                name={['ollama', 'model']}
                                initialValue={vectorConfig.model}
                            >
                                <Select
                                    options={getVectorModelOptions('ollama')}
                                    style={{ width: 200 }}
                                    onChange={(value) => {
                                        const model = settings.vectorSettings.ollama.models.find(m => m.value === value);
                                        updateVectorConfig('ollama', {
                                            model: value,
                                            dimension: model.dimension
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API地址"
                                name={['ollama', 'apiUrl']}
                                initialValue={vectorConfig.apiUrl}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorConfig('ollama', { apiUrl: e.target.value });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    {vectorProvider === 'custom' && (
                        <>
                            <Form.Item
                                label="模型名称"
                                name={['custom', 'model']}
                                initialValue={vectorConfig.model}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorConfig('custom', { model: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API地址"
                                name={['custom', 'apiUrl']}
                                initialValue={vectorConfig.apiUrl}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorConfig('custom', { apiUrl: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API密钥"
                                name={['custom', 'apiKey']}
                                initialValue={vectorConfig.apiKey}
                            >
                                <Input.Password
                                    onChange={(e) => {
                                        updateVectorConfig('custom', { apiKey: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="向量维度"
                                name={['custom', 'dimension']}
                                initialValue={vectorConfig.dimension}
                            >
                                <InputNumber
                                    min={1}
                                    max={4096}
                                    onChange={(value) => {
                                        updateVectorConfig('custom', { dimension: value });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    <Divider />

                    <Form.Item
                        label={
                            <span>
                                向量数据库
                                <Tooltip title="选择用于存储和检索文本向量的数据库">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            value={settings.vectorDB.type}
                            onChange={(value) => {
                                updateVectorDBConfig(value, settings.vectorDB[value]);
                            }}
                            options={vectorDBOptions}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    {settings.vectorDB.type === 'chroma' && (
                        <>
                            <Form.Item
                                label="主机地址"
                                name={['chroma', 'host']}
                                initialValue={settings.vectorDB.chroma.host}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('chroma', {
                                            ...settings.vectorDB.chroma,
                                            host: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="端口"
                                name={['chroma', 'port']}
                                initialValue={settings.vectorDB.chroma.port}
                            >
                                <InputNumber
                                    min={1}
                                    max={65535}
                                    onChange={(value) => {
                                        updateVectorDBConfig('chroma', {
                                            ...settings.vectorDB.chroma,
                                            port: value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="集合名称"
                                name={['chroma', 'collection']}
                                initialValue={settings.vectorDB.chroma.collection}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('chroma', {
                                            ...settings.vectorDB.chroma,
                                            collection: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    {settings.vectorDB.type === 'milvus' && (
                        <>
                            <Form.Item
                                label="主机地址"
                                name={['milvus', 'host']}
                                initialValue={settings.vectorDB.milvus.host}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('milvus', {
                                            ...settings.vectorDB.milvus,
                                            host: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="端口"
                                name={['milvus', 'port']}
                                initialValue={settings.vectorDB.milvus.port}
                            >
                                <InputNumber
                                    min={1}
                                    max={65535}
                                    onChange={(value) => {
                                        updateVectorDBConfig('milvus', {
                                            ...settings.vectorDB.milvus,
                                            port: value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="集合名称"
                                name={['milvus', 'collection']}
                                initialValue={settings.vectorDB.milvus.collection}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('milvus', {
                                            ...settings.vectorDB.milvus,
                                            collection: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}

                    {settings.vectorDB.type === 'qdrant' && (
                        <>
                            <Form.Item
                                label="主机地址"
                                name={['qdrant', 'host']}
                                initialValue={settings.vectorDB.qdrant.host}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('qdrant', {
                                            ...settings.vectorDB.qdrant,
                                            host: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="端口"
                                name={['qdrant', 'port']}
                                initialValue={settings.vectorDB.qdrant.port}
                            >
                                <InputNumber
                                    min={1}
                                    max={65535}
                                    onChange={(value) => {
                                        updateVectorDBConfig('qdrant', {
                                            ...settings.vectorDB.qdrant,
                                            port: value
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="集合名称"
                                name={['qdrant', 'collection']}
                                initialValue={settings.vectorDB.qdrant.collection}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorDBConfig('qdrant', {
                                            ...settings.vectorDB.qdrant,
                                            collection: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
}

export default LLMSettings; 