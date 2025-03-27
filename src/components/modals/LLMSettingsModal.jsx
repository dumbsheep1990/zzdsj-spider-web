import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Radio,
    Slider,
    Button,
    Space,
    Divider,
    Typography,
    Switch,
    InputNumber,
    Alert,
    Tabs,
    Tooltip,
    message,
    Badge,
    Card
} from 'antd';
import {
    RobotOutlined,
    SaveOutlined,
    ApiOutlined,
    InfoCircleOutlined,
    LockOutlined,
    CloudServerOutlined,
    DesktopOutlined,
    ApartmentOutlined,
    DatabaseOutlined,
    QuestionCircleOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { llmAPI, vectorAPI } from '../../api';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function LLMSettingsModal({ visible, onCancel }) {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('cloud');
    const [currentVectorProvider, setCurrentVectorProvider] = useState('ollama');
    const [currentVectorDBType, setCurrentVectorDBType] = useState('chroma');
    const [formReady, setFormReady] = useState(false);

    const { 
        settings, 
        updateVectorConfig, 
        setActiveVectorProvider,
        updateVectorDBConfig,
        updateLLMConfig,
        setUseServerConfig,
        loadServerLLMConfig
    } = useGlobalSettings();

    // 合并默认值和设置
    const vectorSettings = {
        activeProvider: settings?.vectorSettings?.activeProvider || 'ollama',
        ollama: {
            model: settings?.vectorSettings?.ollama?.model || 'llama2',
            apiUrl: settings?.vectorSettings?.ollama?.apiUrl || 'http://localhost:11434',
            models: settings?.vectorSettings?.ollama?.models || [
                { label: 'Llama 2', value: 'llama2', dimension: 4096 },
                { label: 'Mistral', value: 'mistral', dimension: 4096 },
                { label: 'Phi-2', value: 'phi', dimension: 2560 }
            ]
        },
        custom: {
            model: settings?.vectorSettings?.custom?.model || '',
            apiUrl: settings?.vectorSettings?.custom?.apiUrl || '',
            apiKey: settings?.vectorSettings?.custom?.apiKey || '',
            dimension: settings?.vectorSettings?.custom?.dimension || 1536
        }
    };

    const vectorDB = {
        type: settings?.vectorDB?.type || 'chroma',
        chroma: {
            host: settings?.vectorDB?.chroma?.host || 'localhost',
            port: settings?.vectorDB?.chroma?.port || 8000,
            collection: settings?.vectorDB?.chroma?.collection || 'default'
        },
        milvus: {
            host: settings?.vectorDB?.milvus?.host || 'localhost',
            port: settings?.vectorDB?.milvus?.port || 19530,
            collection: settings?.vectorDB?.milvus?.collection || 'default'
        },
        qdrant: {
            host: settings?.vectorDB?.qdrant?.host || 'localhost',
            port: settings?.vectorDB?.qdrant?.port || 6333,
            collection: settings?.vectorDB?.qdrant?.collection || 'default'
        }
    };
    
    // 初始化当前向量提供商和数据库类型
    useEffect(() => {
        setCurrentVectorProvider(vectorSettings.activeProvider);
        setCurrentVectorDBType(vectorDB.type);
    }, []);

    useEffect(() => {
        if (form) {
            setFormReady(true);
        }
    }, [form]);

    // 表单初始化后的处理
    useEffect(() => {
        if (formReady) {
            // 如果settings中useServerConfig为true，则确保UI状态一致
            if (settings?.llmSettings?.useServerConfig) {
                // 更新表单字段
                form.setFieldsValue({ use_server_config: true });
            }
            
            // 高级设置模式状态
            form.setFieldsValue({ advanced_mode: false });
        }
    }, [formReady, settings]);

    // 提交表单
    const handleSubmit = async () => {
        if (form.getFieldValue('use_server_config')) {
            // 如果使用后端服务配置，直接保存use_server_config字段，跳过其他验证
            const values = form.getFieldsValue();
            await llmAPI.saveConfig({
                use_server_config: values.use_server_config,
                active_provider: values.active_provider
            });
            message.success('配置保存成功');
            onCancel();
            return;
        }

        try {
            const values = await form.validateFields();
            
            // 保存LLM配置
            await llmAPI.saveConfig({
                activeProvider: values.active_provider,
                cloud: values.cloud,
                ollama: values.ollama,
                custom: values.custom,
                advanced: values.advanced
            });
            
            // 保存向量化配置
            await vectorAPI.saveConfig({
                provider: values.vector.provider,
                ollama: values.vector.ollama,
                custom: values.vector.custom
            });
            
            // 更新全局设置
            updateLLMConfig(values.active_provider, {
                ...values[values.active_provider],
                advanced: values.advanced
            });
            
            updateVectorConfig(values.vector.provider, values.vector[values.vector.provider]);
            
            message.success('配置保存成功');
            onCancel();
        } catch (error) {
            console.error('保存配置失败:', error);
            message.error('保存配置失败: ' + error.message);
        }
    };

    // 测试连接
    const testConnection = async (provider) => {
        try {
            const values = await form.validateFields();
            const config = values[provider];
            
            // 检查服务是否已启用
            if (config && !config?.enabled) {
                message.warning(`请先启用 ${provider} 服务，然后进行连接测试`);
                return;
            }
            
            // 检查配置是否存在
            if (!config) {
                message.error(`${provider} 配置不存在，请检查配置`);
                return;
            }
            
            // 确保provider字段在顶层，不会被config中的同名字段覆盖
            const result = await llmAPI.testConnection({
                provider: provider, // 明确设置provider字段
                config: config      // 将配置作为一个独立对象发送
            });
            
            if (result.data.connected) {
                message.success(`${provider} 连接测试成功`);
            } else {
                message.error(`${provider} 连接测试失败: ${result.data.message}`);
            }
        } catch (error) {
            console.error('连接测试失败:', error);
            message.error('连接测试失败: ' + error.message);
        }
    };

    // 处理向量提供商变更
    const handleVectorProviderChange = (value) => {
        setCurrentVectorProvider(value);
        setActiveVectorProvider(value);
        form.setFieldsValue({
            vector: {
                provider: value
            }
        });
    };

    // 处理向量数据库类型变更
    const handleVectorDBTypeChange = (value) => {
        setCurrentVectorDBType(value);
        
        // 先创建一个默认配置，确保有值可用
        const defaultDbConfig = {
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
        };
        
        // 使用当前配置或默认配置
        const currentConfig = vectorDB[value] || defaultDbConfig[value];
        
        // 更新全局状态
        updateVectorDBConfig(value, currentConfig);
        
        // 更新表单状态
        form.setFieldsValue({
            vectorDB: {
                type: value
            }
        });
    };

    // 处理使用后端服务配置的变化
    const handleUseServerConfigChange = async (checked) => {
        try {
            console.log('DEBUG设置使用后端服务配置状态:', checked);
            const result = await setUseServerConfig(checked);
            console.log('DEBUG设置使用后端服务配置结果:', result);
            form.setFieldsValue({ use_server_config: checked });
            
            // 更新localStorage中的设置
            localStorage.setItem('globalSettings', JSON.stringify({
                ...settings,
                llmSettings: {
                    ...settings.llmSettings,
                    useServerConfig: checked
                }
            }));
            console.log('DEBUG更新localStorage中的设置');
            
            // 更新Tabs的禁用状态
            setActiveTab(checked ? 'cloud' : activeTab);
            
            // 更新表单状态以刷新UI
            setFormReady(false);
            setTimeout(() => setFormReady(true), 10);
            
            if (!checked) {
                // 如果关闭了使用后端服务配置，确保解除所有禁用状态
                setTimeout(() => enableTabsAndControls(), 50);
            } else {
                // 如果启用了使用后端服务配置，提示信息
                message.success('已启用使用后端服务配置，将使用后端服务的默认模型配置');
            }
        } catch (error) {
            console.error('设置使用后端服务配置失败:', error);
            message.error('设置使用后端服务配置失败: ' + error.message);
        }
    };

    // 云模型选项
    const cloudModelOptions = [
        { label: 'Deepseek-7B', value: 'deepseek-7b', provider: 'deepseek' },
        { label: 'Deepseek-67B', value: 'deepseek-67b', provider: 'deepseek' },
        { label: '豆包-7B', value: 'doubao-7b', provider: 'doubao' },
        { label: '豆包-13B', value: 'doubao-13b', provider: 'doubao' },
        { label: '通义千问-7B', value: 'qianwen-7b', provider: 'aliyun' },
        { label: '通义千问-72B', value: 'qianwen-72b', provider: 'aliyun' },
        { label: 'GLM-4', value: 'glm-4', provider: 'zhipu' },
        { label: 'GLM-3-Turbo', value: 'glm-3-turbo', provider: 'zhipu' }
    ];

    // Ollama模型选项
    const ollamaModelOptions = [
        { label: 'Llama 2', value: 'llama2', provider: 'ollama' },
        { label: 'Llama 3', value: 'llama3', provider: 'ollama' },
        { label: 'Mistral', value: 'mistral', provider: 'ollama' },
        { label: 'Phi-2', value: 'phi', provider: 'ollama' },
        { label: 'Vicuna', value: 'vicuna', provider: 'ollama' },
        { label: 'Orca Mini', value: 'orca-mini', provider: 'ollama' }
    ];

    // 重置到默认值
    const resetToDefault = () => {
        form.setFieldsValue({
            cloud: {
                model: 'deepseek-7b',
                provider: 'deepseek',
                api_key: form.getFieldValue(['cloud', 'api_key']) || '',
                api_base: form.getFieldValue(['cloud', 'api_base']) || '',
                enabled: settings?.llmSettings?.cloud?.enabled || false
            },
            ollama: {
                model: 'llama2',
                api_url: form.getFieldValue(['ollama', 'api_url']) || 'http://localhost:11434',
                enabled: settings?.llmSettings?.ollama?.enabled || false
            },
            custom: {
                model: '',
                api_url: form.getFieldValue(['custom', 'api_url']) || '',
                api_key: form.getFieldValue(['custom', 'api_key']) || '',
                enabled: settings?.llmSettings?.custom?.enabled || false
            },
            active_provider: 'cloud',
            advanced: {
                temperature: 0.7,
                max_tokens: 1000,
                timeout: 30,
                retry_count: 3
            }
        });
        setActiveTab('cloud');
    };

    // 根据选择的云模型更新提供商
    const handleCloudModelChange = (value) => {
        form.setFieldsValue({
            cloud: {
                ...form.getFieldValue('cloud'),
                model: value
            }
        });
    };

    // 处理标签页切换
    const handleTabChange = (key) => {
        setActiveTab(key);
        form.setFieldsValue({ active_provider: key });
    };

    // 判断配置是否禁用
    const isConfigDisabled = () => {
        if (!formReady) return settings?.llmSettings?.useServerConfig || false;
        return form.getFieldValue('use_server_config');
    };

    // 恢复Tabs和表单控件的禁用状态
    const enableTabsAndControls = () => {
        // 手动移除表单控件的禁用状态
        const formItems = document.querySelectorAll('.ant-form-item');
        formItems.forEach(item => {
            const inputs = item.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.disabled) {
                    input.disabled = false;
                }
            });
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <RobotOutlined />
                    <span>LLM 模型设置</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            width={700}
            footer={[
                <Button key="test" icon={<LinkOutlined />} onClick={() => testConnection(activeTab)}>
                    测试连接
                </Button>,
                <Button key="reset" onClick={resetToDefault}>
                    恢复默认
                </Button>,
                <Button key="cancel" onClick={onCancel}>
                    取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                >
                    保存设置
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    cloud: {
                        model: settings?.llmSettings?.cloud?.model || 'deepseek-7b',
                        provider: settings?.llmSettings?.cloud?.provider || 'deepseek',
                        api_key: settings?.llmSettings?.cloud?.api_key || '',
                        api_base: settings?.llmSettings?.cloud?.api_base || '',
                        enabled: settings?.llmSettings?.cloud?.enabled || false
                    },
                    ollama: {
                        model: settings?.llmSettings?.ollama?.model || 'llama2',
                        api_url: settings?.llmSettings?.ollama?.api_url || 'http://localhost:11434',
                        enabled: settings?.llmSettings?.ollama?.enabled || false
                    },
                    custom: {
                        model: settings?.llmSettings?.custom?.model || '',
                        api_url: settings?.llmSettings?.custom?.api_url || '',
                        api_key: settings?.llmSettings?.custom?.api_key || '',
                        enabled: settings?.llmSettings?.custom?.enabled || false
                    },
                    active_provider: settings?.llmSettings?.activeProvider || 'cloud',
                    use_server_config: settings?.llmSettings?.useServerConfig || false,
                    advanced: settings?.llmSettings?.advanced || {
                        temperature: 0.7,
                        max_tokens: 1000,
                        timeout: 30,
                        retry_count: 3
                    },
                    vector: {
                        provider: vectorSettings.activeProvider,
                        ollama: {
                            model: vectorSettings.ollama.model,
                            apiUrl: vectorSettings.ollama.apiUrl,
                        },
                        custom: {
                            model: vectorSettings.custom.model,
                            apiUrl: vectorSettings.custom.apiUrl,
                            apiKey: vectorSettings.custom.apiKey,
                            dimension: vectorSettings.custom.dimension,
                        }
                    },
                    vectorDB: {
                        type: vectorDB.type,
                        chroma: vectorDB.chroma,
                        milvus: vectorDB.milvus,
                        qdrant: vectorDB.qdrant
                    }
                }}
            >
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
                            checked={form.getFieldValue('use_server_config')}
                            onChange={handleUseServerConfigChange}
                        />
                    </div>
                    {form.getFieldValue('use_server_config') && settings.llmSettings.serverConfig && (
                        <div style={{ marginTop: 12 }}>
                            <Text type="secondary">
                                <span>当前使用后端服务配置: </span>
                                <Badge status="success" />
                                <span>主要模型: {settings.llmSettings.serverConfig.primary_service || '未指定'}</span>
                            </Text>
                        </div>
                    )}
                </div>

                <Alert
                    message="这些设置将影响系统中所有使用大型语言模型的功能"
                    description="包括内容提取、智能清洗、单页爬取等功能。不同模型会产生不同的结果和性能表现。"
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />

                <Form.Item
                    name="active_provider"
                    hidden
                >
                    <Input />
                </Form.Item>

                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={[
                        {
                            key: 'cloud',
                            label: (
                                <span>
                                    <CloudServerOutlined />
                                    云服务 LLM
                                    {settings?.llmSettings?.cloud?.enabled ? (
                                        <Badge status="success" style={{ marginLeft: 8 }} />
                                    ) : (
                                        <Badge status="default" style={{ marginLeft: 8 }} />
                                    )}
                                </span>
                            ),
                            disabled: isConfigDisabled(),
                            children: (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span>
                                            <strong>使用云服务LLM</strong>
                                        </span>
                                        <Form.Item
                                            name={['cloud', 'enabled']}
                                            valuePropName="checked"
                                            style={{ margin: 0 }}
                                        >
                                            <Switch
                                                checkedChildren="已启用"
                                                unCheckedChildren="未启用"
                                                disabled={isConfigDisabled()}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        name={['cloud', 'model']}
                                        label="LLM模型"
                                        rules={[{ required: activeTab === 'cloud', message: '请选择LLM模型' }]}
                                    >
                                        <Select onChange={handleCloudModelChange} disabled={isConfigDisabled()}>
                                            {cloudModelOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name={['cloud', 'provider']}
                                        label="服务提供商"
                                    >
                                        <Radio.Group disabled={isConfigDisabled()}>
                                            <Radio.Button value="deepseek">Deepseek</Radio.Button>
                                            <Radio.Button value="doubao">豆包</Radio.Button>
                                            <Radio.Button value="aliyun">阿里云</Radio.Button>
                                            <Radio.Button value="zhipu">智谱AI</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Form.Item
                                        name={['cloud', 'api_key']}
                                        label="API密钥"
                                        tooltip="设置对应提供商的API密钥"
                                        rules={[
                                            {
                                                required: activeTab === 'cloud',
                                                message: '请输入API密钥'
                                            }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="输入所选服务提供商的API密钥"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name={['cloud', 'api_base']}
                                        label="API基础URL (可选)"
                                        tooltip="如果需要使用自定义API服务端点，请在此输入"
                                    >
                                        <Input
                                            placeholder="例如：https://api.deepseek.com/v1"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>

                                    <Alert
                                        message="云服务API说明"
                                        description={
                                            <div>
                                                <p>请确保已在对应服务提供商平台注册并获取API密钥。</p>
                                                <p>不同服务提供商的计费标准和使用限制可能不同，请参考各自的官方文档。</p>
                                            </div>
                                        }
                                        type="info"
                                        showIcon
                                        style={{ marginTop: '10px' }}
                                    />
                                </div>
                            )
                        },
                        {
                            key: 'ollama',
                            label: (
                                <span>
                                    <DesktopOutlined />
                                    Ollama 本地模型
                                </span>
                            ),
                            disabled: isConfigDisabled(),
                            children: (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span>
                                            <strong>使用Ollama本地模型</strong>
                                        </span>
                                        <Form.Item
                                            name={['ollama', 'enabled']}
                                            valuePropName="checked"
                                            style={{ margin: 0 }}
                                        >
                                            <Switch
                                                checkedChildren="已启用"
                                                unCheckedChildren="未启用"
                                                disabled={isConfigDisabled()}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        name={['ollama', 'model']}
                                        label="Ollama模型类型"
                                        rules={[{ required: activeTab === 'ollama', message: '请选择Ollama模型类型' }]}
                                    >
                                        <Select disabled={isConfigDisabled()}>
                                            {ollamaModelOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name={['ollama', 'api_url']}
                                        label="Ollama API地址"
                                        tooltip="Ollama服务的地址，默认为本地地址"
                                        rules={[
                                            {
                                                required: activeTab === 'ollama',
                                                message: '请输入Ollama API地址'
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder="例如：http://localhost:11434"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>
                                </div>
                            )
                        },
                        {
                            key: 'custom',
                            label: (
                                <span>
                                    <ApartmentOutlined />
                                    自定义API接口
                                </span>
                            ),
                            disabled: isConfigDisabled(),
                            children: (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span>
                                            <strong>使用自定义API</strong>
                                        </span>
                                        <Form.Item
                                            name={['custom', 'enabled']}
                                            valuePropName="checked"
                                            style={{ margin: 0 }}
                                        >
                                            <Switch
                                                checkedChildren="已启用"
                                                unCheckedChildren="未启用"
                                                disabled={isConfigDisabled()}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        name={['custom', 'model']}
                                        label="模型名称"
                                        tooltip="自定义API服务使用的模型名称"
                                        rules={[{ required: activeTab === 'custom', message: '请输入模型名称' }]}
                                    >
                                        <Input
                                            placeholder="例如：gpt-3.5-turbo, llama-7b, text-davinci-003等"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name={['custom', 'api_url']}
                                        label="API接口地址"
                                        tooltip="完整的API接口地址"
                                        rules={[
                                            {
                                                required: activeTab === 'custom',
                                                message: '请输入API接口地址'
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder="例如：https://your-api-server.com/v1/chat/completions"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name={['custom', 'api_key']}
                                        label="API密钥 (如需要)"
                                        tooltip="如果自定义API需要密钥认证，请在此输入"
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="API密钥"
                                            disabled={isConfigDisabled()}
                                        />
                                    </Form.Item>

                                    <Alert
                                        message="自定义API接口说明"
                                        description={
                                            <div>
                                                <p>自定义API接口需要与OpenAI API格式兼容，支持聊天补全接口。</p>
                                                <p>如果您使用的是其他格式的API，可能需要在系统中进行额外的适配开发。</p>
                                            </div>
                                        }
                                        type="info"
                                        showIcon
                                        style={{ marginTop: '10px' }}
                                    />
                                </div>
                            )
                        },
                        {
                            key: 'vector',
                            label: (
                                <span>
                                    <DatabaseOutlined />
                                    向量化设置
                                </span>
                            ),
                            disabled: isConfigDisabled(),
                            children: (
                                <div>
                                    <Form.Item
                                        label={
                                            <span>
                                                向量化提供商
                                                <Tooltip title="选择用于生成文本向量的模型提供商">
                                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                                </Tooltip>
                                            </span>
                                        }
                                        name={['vector', 'provider']}
                                    >
                                        <Select
                                            options={[
                                                { label: 'Ollama 本地模型', value: 'ollama' },
                                                { label: '自定义 API', value: 'custom' }
                                            ]}
                                            style={{ width: 200 }}
                                            onChange={handleVectorProviderChange}
                                        />
                                    </Form.Item>

                                    {currentVectorProvider === 'ollama' && (
                                        <>
                                            <Form.Item
                                                label="模型"
                                                name={['vector', 'ollama', 'model']}
                                            >
                                                <Select
                                                    options={vectorSettings.ollama.models}
                                                    style={{ width: 200 }}
                                                    onChange={(value) => {
                                                        const model = vectorSettings.ollama.models.find(m => m.value === value);
                                                        updateVectorConfig('ollama', {
                                                            model: value,
                                                            dimension: model?.dimension || 4096
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={['vector', 'ollama', 'apiUrl']}
                                                label="Ollama API地址"
                                                tooltip="Ollama服务的地址，默认为本地地址"
                                                rules={[
                                                    {
                                                        required: currentVectorProvider === 'ollama',
                                                        message: '请输入Ollama API地址'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="例如：http://localhost:11434"
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    {currentVectorProvider === 'custom' && (
                                        <>
                                            <Form.Item
                                                label="模型名称"
                                                name={['vector', 'custom', 'model']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorConfig('custom', { model: e.target.value });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={['vector', 'custom', 'apiUrl']}
                                                label="API地址"
                                                tooltip="完整的API接口地址"
                                                rules={[
                                                    {
                                                        required: currentVectorProvider === 'custom',
                                                        message: '请输入API接口地址'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorConfig('custom', { apiUrl: e.target.value });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={['vector', 'custom', 'apiKey']}
                                                label="API密钥"
                                                tooltip="如果自定义API需要密钥认证，请在此输入"
                                            >
                                                <Input.Password
                                                    onChange={(e) => {
                                                        updateVectorConfig('custom', { apiKey: e.target.value });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={['vector', 'custom', 'dimension']}
                                                label="向量维度"
                                                tooltip="自定义API服务使用的向量维度"
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
                                        name={['vectorDB', 'type']}
                                    >
                                        <Select
                                            options={[
                                                { label: 'Chroma', value: 'chroma' },
                                                { label: 'Milvus', value: 'milvus' },
                                                { label: 'Qdrant', value: 'qdrant' }
                                            ]}
                                            style={{ width: 200 }}
                                            onChange={handleVectorDBTypeChange}
                                        />
                                    </Form.Item>

                                    {currentVectorDBType === 'chroma' && (
                                        <>
                                            <Form.Item
                                                label="主机地址"
                                                name={['vectorDB', 'chroma', 'host']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('chroma', {
                                                            ...vectorDB.chroma,
                                                            host: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="端口"
                                                name={['vectorDB', 'chroma', 'port']}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={65535}
                                                    onChange={(value) => {
                                                        updateVectorDBConfig('chroma', {
                                                            ...vectorDB.chroma,
                                                            port: value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="集合名称"
                                                name={['vectorDB', 'chroma', 'collection']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('chroma', {
                                                            ...vectorDB.chroma,
                                                            collection: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    {currentVectorDBType === 'milvus' && (
                                        <>
                                            <Form.Item
                                                label="主机地址"
                                                name={['vectorDB', 'milvus', 'host']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('milvus', {
                                                            ...vectorDB.milvus,
                                                            host: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="端口"
                                                name={['vectorDB', 'milvus', 'port']}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={65535}
                                                    onChange={(value) => {
                                                        updateVectorDBConfig('milvus', {
                                                            ...vectorDB.milvus,
                                                            port: value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="集合名称"
                                                name={['vectorDB', 'milvus', 'collection']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('milvus', {
                                                            ...vectorDB.milvus,
                                                            collection: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    {currentVectorDBType === 'qdrant' && (
                                        <>
                                            <Form.Item
                                                label="主机地址"
                                                name={['vectorDB', 'qdrant', 'host']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('qdrant', {
                                                            ...vectorDB.qdrant,
                                                            host: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="端口"
                                                name={['vectorDB', 'qdrant', 'port']}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={65535}
                                                    onChange={(value) => {
                                                        updateVectorDBConfig('qdrant', {
                                                            ...vectorDB.qdrant,
                                                            port: value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="集合名称"
                                                name={['vectorDB', 'qdrant', 'collection']}
                                            >
                                                <Input
                                                    onChange={(e) => {
                                                        updateVectorDBConfig('qdrant', {
                                                            ...vectorDB.qdrant,
                                                            collection: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </>
                                    )}
                                </div>
                            )
                        }
                    ]}
                />
                {activeTab !== "vector" && (
                    <>
                        <Divider style={{ margin: '16px 0 0 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                            <span>
                                <strong>高级设置</strong>
                            </span>
                            <Form.Item
                                name="advanced_mode"
                                valuePropName="checked"
                                style={{ margin: 0 }}
                            >
                                <Switch
                                    checkedChildren="开启"
                                    unCheckedChildren="关闭"
                                />
                            </Form.Item>
                        </div>
                        <Form.Item noStyle shouldUpdate>
                            {({ getFieldValue }) => {
                                return getFieldValue('advanced_mode') ? (
                                    <>
                                        <Divider style={{ margin: '12px 0' }} />

                                        <Form.Item
                                            name={['advanced', 'temperature']}
                                            label={
                                                <Space>
                                                    <Text>温度参数</Text>
                                                    <Text type="secondary">(Temperature)</Text>
                                                </Space>
                                            }
                                            tooltip="控制生成文本的随机性，越高结果越随机多样，越低结果越确定"
                                        >
                                            <Slider
                                                min={0}
                                                max={2}
                                                step={0.1}
                                                marks={{ 0: '精确', 1: '平衡', 2: '创意' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name={['advanced', 'max_tokens']}
                                            label={
                                                <Space>
                                                    <Text>最大输出长度</Text>
                                                    <Text type="secondary">(Max Tokens)</Text>
                                                </Space>
                                            }
                                            tooltip="限制单次响应的最大长度"
                                        >
                                            <InputNumber min={100} max={4000} step={100} style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            name={['advanced', 'timeout']}
                                            label="请求超时时间 (秒)"
                                            tooltip="API请求的最大等待时间"
                                        >
                                            <InputNumber min={5} max={300} style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            name={['advanced', 'retry_count']}
                                            label="失败重试次数"
                                            tooltip="API请求失败时的重试次数"
                                        >
                                            <InputNumber min={0} max={10} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </>
                                ) : null;
                            }}
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}

export default LLMSettingsModal;