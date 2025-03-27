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
    Divider,
    Switch,
    Tabs,
    Badge
} from 'antd';
import { QuestionCircleOutlined, CloudOutlined, DesktopOutlined, ApiOutlined } from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function LLMSettings() {
    const { 
        settings, 
        updateLLMConfig, 
        setActiveLLMProvider, 
        getActiveLLMConfig, 
        updateVectorConfig, 
        setActiveVectorProvider, 
        getActiveVectorConfig,
        updateVectorDBConfig,
        setUseServerConfig,
        loadServerLLMConfig
    } = useGlobalSettings();
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
                <Title level={5} style={{ marginBottom: 16 }}>大语言模型配置界面</Title>

                {/* 使用后端服务配置的开关 */}
                <div style={{ marginBottom: 24, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            <strong>使用后端服务模型配置</strong>
                            <Tooltip title="启用后将使用后端服务的默认模型配置，其他所有模型配置将被禁用">
                                <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                            </Tooltip>
                        </span>
                        <Switch
                            checkedChildren="已启用"
                            unCheckedChildren="未启用"
                            checked={settings.llmSettings.useServerConfig}
                            onChange={(checked) => {
                                setUseServerConfig(checked);
                            }}
                        />
                    </div>
                    {settings.llmSettings.useServerConfig && settings.llmSettings.serverConfig && (
                        <div style={{ marginTop: 12 }}>
                            <Text type="secondary">
                                <span>当前使用后端服务配置: </span>
                                <Badge status="success" />
                                <span>主要模型: {settings.llmSettings.serverConfig.primary_service || '未指定'}</span>
                            </Text>
                        </div>
                    )}
                </div>

                {/* 使用新的Tabs组件展示LLM提供商选项 */}
                {!settings.llmSettings.useServerConfig && (
                    <Tabs
                        defaultActiveKey={llmProvider}
                        onChange={setActiveLLMProvider}
                        items={[
                            {
                                key: 'cloud',
                                label: (
                                    <span>
                                        <CloudOutlined />
                                        云服务 LLM
                                        {settings.llmSettings.cloud.enabled ? (
                                            <Badge status="success" style={{ marginLeft: 8 }} />
                                        ) : (
                                            <Badge status="default" style={{ marginLeft: 8 }} />
                                        )}
                                    </span>
                                ),
                                children: (
                                    <>
                                        <Form layout="vertical">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span>
                                                    <strong>使用云服务 LLM</strong>
                                                </span>
                                                <Switch
                                                    checkedChildren="已启用"
                                                    unCheckedChildren="未启用"
                                                    checked={settings.llmSettings.cloud.enabled}
                                                    onChange={(checked) => {
                                                        updateLLMConfig('cloud', { enabled: checked });
                                                    }}
                                                />
                                            </div>

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
                                                    disabled={!settings.llmSettings.cloud.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="服务提供商"
                                                name={['cloud', 'provider']}
                                                initialValue={llmConfig.provider}
                                            >
                                                <Select
                                                    style={{ width: 200 }}
                                                    onChange={(value) => {
                                                        updateLLMConfig('cloud', { provider: value });
                                                    }}
                                                    disabled={!settings.llmSettings.cloud.enabled}
                                                >
                                                    <Option value="deepseek">Deepseek</Option>
                                                    <Option value="doubao">豆瓣</Option>
                                                    <Option value="zhipu">知谱 GLM</Option>
                                                    <Option value="aliyun">阿里云智能服务</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                label={
                                                    <span>
                                                        API Key
                                                        <Tooltip title="用于云服务提供商的认证信息">
                                                            <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                                                        </Tooltip>
                                                    </span>
                                                }
                                                name={['cloud', 'apiKey']}
                                                initialValue={llmConfig.apiKey}
                                            >
                                                <Input.Password
                                                    onChange={(e) => {
                                                        updateLLMConfig('cloud', { apiKey: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.cloud.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="API 基础 URL"
                                                name={['cloud', 'apiBase']}
                                                initialValue={llmConfig.apiBase}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateLLMConfig('cloud', { apiBase: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.cloud.enabled}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </>
                                )
                            },
                            {
                                key: 'ollama',
                                label: (
                                    <span>
                                        <DesktopOutlined />
                                        Ollama 本地模型
                                        {settings.llmSettings.ollama.enabled ? (
                                            <Badge status="success" style={{ marginLeft: 8 }} />
                                        ) : (
                                            <Badge status="default" style={{ marginLeft: 8 }} />
                                        )}
                                    </span>
                                ),
                                children: (
                                    <>
                                        <Form layout="vertical">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span>
                                                    <strong>使用 Ollama 本地模型</strong>
                                                </span>
                                                <Switch
                                                    checkedChildren="已启用"
                                                    unCheckedChildren="未启用"
                                                    checked={settings.llmSettings.ollama.enabled}
                                                    onChange={(checked) => {
                                                        updateLLMConfig('ollama', { enabled: checked });
                                                    }}
                                                />
                                            </div>

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
                                                    disabled={!settings.llmSettings.ollama.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="API 地址"
                                                name={['ollama', 'apiUrl']}
                                                initialValue={llmConfig.apiUrl}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateLLMConfig('ollama', { apiUrl: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.ollama.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="超时时间（秒）"
                                                name={['ollama', 'timeout']}
                                                initialValue={llmConfig.timeout}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={3600}
                                                    onChange={(value) => {
                                                        updateLLMConfig('ollama', { timeout: value });
                                                    }}
                                                    disabled={!settings.llmSettings.ollama.enabled}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </>
                                )
                            },
                            {
                                key: 'custom',
                                label: (
                                    <span>
                                        <ApiOutlined />
                                        自定义 API
                                        {settings.llmSettings.custom.enabled ? (
                                            <Badge status="success" style={{ marginLeft: 8 }} />
                                        ) : (
                                            <Badge status="default" style={{ marginLeft: 8 }} />
                                        )}
                                    </span>
                                ),
                                children: (
                                    <>
                                        <Form layout="vertical">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span>
                                                    <strong>使用自定义 API</strong>
                                                </span>
                                                <Switch
                                                    checkedChildren="已启用"
                                                    unCheckedChildren="未启用"
                                                    checked={settings.llmSettings.custom.enabled}
                                                    onChange={(checked) => {
                                                        updateLLMConfig('custom', { enabled: checked });
                                                    }}
                                                />
                                            </div>

                                            <Form.Item
                                                label="模型名称"
                                                name={['custom', 'model']}
                                                initialValue={llmConfig.model}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateLLMConfig('custom', { model: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.custom.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label={
                                                    <span>
                                                        API 密钥
                                                        <Tooltip title="用于自定义 API 的认证信息">
                                                            <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                                                        </Tooltip>
                                                    </span>
                                                }
                                                name={['custom', 'apiKey']}
                                                initialValue={llmConfig.apiKey}
                                            >
                                                <Input.Password
                                                    onChange={(e) => {
                                                        updateLLMConfig('custom', { apiKey: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.custom.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="API 地址"
                                                name={['custom', 'apiUrl']}
                                                initialValue={llmConfig.apiUrl}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateLLMConfig('custom', { apiUrl: e.target.value });
                                                    }}
                                                    disabled={!settings.llmSettings.custom.enabled}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="超时时间（秒）"
                                                name={['custom', 'timeout']}
                                                initialValue={llmConfig.timeout}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={3600}
                                                    onChange={(value) => {
                                                        updateLLMConfig('custom', { timeout: value });
                                                    }}
                                                    disabled={!settings.llmSettings.custom.enabled}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </>
                                )
                            }
                        ]}
                    />
                )}

                {settings.llmSettings.useServerConfig && (
                    <div style={{ marginTop: 24 }}>
                        <Text type="secondary">
                            <span>当前使用后端服务配置: </span>
                            <Badge status="success" />
                            <span>主要模型: {settings.llmSettings.serverConfig.primary_service || '未指定'}</span>
                        </Text>
                    </div>
                )}
            </Card>

            <Card title="向量化配置">
                <Form layout="vertical">
                    <Form.Item
                        label={
                            <span>
                                向量化提供商
                                <Tooltip title="选择用于向量化的提供商">
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
                                label="API 地址"
                                name={['ollama', 'apiUrl']}
                                initialValue={vectorConfig.apiUrl}
                            >
                                <Input
                                    onChange={(e) => {
                                        updateVectorConfig('ollama', { apiUrl: e.target.value });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="超时时间（秒）"
                                name={['ollama', 'timeout']}
                                initialValue={vectorConfig.timeout}
                            >
                                <InputNumber
                                    min={1}
                                    max={3600}
                                    onChange={(value) => {
                                        updateVectorConfig('ollama', { timeout: value });
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
                                label="API 地址"
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
                                label="API 密钥"
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

                            <Form.Item
                                label="超时时间（秒）"
                                name={['custom', 'timeout']}
                                initialValue={vectorConfig.timeout}
                            >
                                <InputNumber
                                    min={1}
                                    max={3600}
                                    onChange={(value) => {
                                        updateVectorConfig('custom', { timeout: value });
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
                                <Tooltip title="选择用于向量化的数据库">
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