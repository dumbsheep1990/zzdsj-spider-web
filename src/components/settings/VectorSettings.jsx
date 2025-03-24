import React from 'react';
import {
    Form,
    Select,
    Input,
    InputNumber,
    Card,
    Typography,
    Space,
    Tooltip
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function VectorSettings() {
    const { settings, updateVectorConfig, setActiveVectorProvider, getActiveVectorConfig } = useGlobalSettings();
    const { provider, config } = getActiveVectorConfig();

    // 向量化提供商选项
    const providerOptions = [
        { label: 'Ollama 本地模型', value: 'ollama' },
        { label: '自定义 API', value: 'custom' }
    ];

    // 向量数据库选项
    const vectorDBOptions = [
        { label: 'Chroma', value: 'chroma' },
        { label: 'Milvus', value: 'milvus' },
        { label: 'Qdrant', value: 'qdrant' }
    ];

    // 获取当前选中提供商的模型选项
    const getModelOptions = (provider) => {
        if (!provider) return [];
        return settings.vectorSettings[provider]?.models || [];
    };

    return (
        <div className="vector-settings">
            <Title level={4}>向量化设置</Title>
            <Paragraph>
                配置文本向量化模型和向量数据库，用于实现文本相似度搜索和语义检索功能。
            </Paragraph>

            <Card title="向量化模型配置" style={{ marginBottom: 16 }}>
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
                            value={provider}
                            onChange={setActiveVectorProvider}
                            options={providerOptions}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    {provider === 'ollama' && (
                        <>
                            <Form.Item
                                label="模型"
                                name={['ollama', 'model']}
                                initialValue={config.model}
                            >
                                <Select
                                    options={getModelOptions('ollama')}
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
                                initialValue={config.apiUrl}
                            >
                                <Input
                                    placeholder="例如：http://localhost:11434"
                                    onChange={(e) => updateVectorConfig('ollama', { apiUrl: e.target.value })}
                                />
                            </Form.Item>
                        </>
                    )}

                    {provider === 'custom' && (
                        <>
                            <Form.Item
                                label="模型名称"
                                name={['custom', 'model']}
                                initialValue={config.model}
                            >
                                <Input
                                    placeholder="例如：text-embedding-ada-002"
                                    onChange={(e) => updateVectorConfig('custom', { model: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API地址"
                                name={['custom', 'apiUrl']}
                                initialValue={config.apiUrl}
                            >
                                <Input
                                    placeholder="例如：https://your-api-server.com/v1/embeddings"
                                    onChange={(e) => updateVectorConfig('custom', { apiUrl: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item
                                label="API密钥"
                                name={['custom', 'apiKey']}
                                initialValue={config.apiKey}
                            >
                                <Input.Password
                                    placeholder="如果需要，请输入API密钥"
                                    onChange={(e) => updateVectorConfig('custom', { apiKey: e.target.value })}
                                />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        label="向量维度"
                        name={['dimension']}
                        initialValue={config.dimension}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: 200 }}
                            disabled
                            placeholder="向量维度"
                        />
                    </Form.Item>
                </Form>
            </Card>

            <Card title="向量数据库配置">
                <Form layout="vertical">
                    <Form.Item
                        label={
                            <span>
                                数据库类型
                                <Tooltip title="选择用于存储和检索向量的数据库">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            value={settings.vectorDB.type}
                            options={vectorDBOptions}
                            style={{ width: 200 }}
                            onChange={(value) => {
                                settings.updateVectorDBConfig(value, settings.vectorDB[value]);
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="主机地址"
                        name={['host']}
                        initialValue={settings.vectorDB[settings.vectorDB.type].host}
                    >
                        <Input
                            placeholder="例如：localhost"
                            onChange={(e) => {
                                settings.updateVectorDBConfig(settings.vectorDB.type, {
                                    ...settings.vectorDB[settings.vectorDB.type],
                                    host: e.target.value
                                });
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="端口"
                        name={['port']}
                        initialValue={settings.vectorDB[settings.vectorDB.type].port}
                    >
                        <InputNumber
                            min={1}
                            max={65535}
                            style={{ width: 200 }}
                            onChange={(value) => {
                                settings.updateVectorDBConfig(settings.vectorDB.type, {
                                    ...settings.vectorDB[settings.vectorDB.type],
                                    port: value
                                });
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="集合名称"
                        name={['collection']}
                        initialValue={settings.vectorDB[settings.vectorDB.type].collection}
                    >
                        <Input
                            placeholder="例如：articles"
                            onChange={(e) => {
                                settings.updateVectorDBConfig(settings.vectorDB.type, {
                                    ...settings.vectorDB[settings.vectorDB.type],
                                    collection: e.target.value
                                });
                            }}
                        />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default VectorSettings; 