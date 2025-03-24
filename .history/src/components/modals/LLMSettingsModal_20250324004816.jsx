import React, { useState } from 'react';
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
    Tabs
} from 'antd';
import {
    RobotOutlined,
    SaveOutlined,
    ApiOutlined,
    InfoCircleOutlined,
    LockOutlined,
    CloudServerOutlined,
    DesktopOutlined,
    ApartmentOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function LLMSettingsModal({ visible, onCancel }) {
    const [form] = Form.useForm();
    const [modelType, setModelType] = useState('gpt-3.5-turbo');
    const [advancedMode, setAdvancedMode] = useState(false);
    const [activeTab, setActiveTab] = useState('cloud');

    // 提交表单
    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log('LLM设置:', values);
                // 这里应该是保存设置的逻辑
                onCancel();
            })
            .catch(error => {
                console.error('验证失败:', error);
            });
    };

    // 云模型选项
    const cloudModelOptions = [
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'openai' },
        { label: 'GPT-4', value: 'gpt-4', provider: 'openai' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo', provider: 'openai' },
        { label: 'Claude 3 Haiku', value: 'claude-3-haiku', provider: 'anthropic' },
        { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet', provider: 'anthropic' },
        { label: 'Claude 3 Opus', value: 'claude-3-opus', provider: 'anthropic' }
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
                model: 'gpt-3.5-turbo',
                provider: 'openai',
                api_key: form.getFieldValue(['cloud', 'api_key']) || '',
                api_base: form.getFieldValue(['cloud', 'api_base']) || '',
            },
            ollama: {
                model: 'llama2',
                api_url: form.getFieldValue(['ollama', 'api_url']) || 'http://localhost:11434',
            },
            custom: {
                model: '',
                api_url: form.getFieldValue(['custom', 'api_url']) || '',
                api_key: form.getFieldValue(['custom', 'api_key']) || '',
            },
            active_provider: 'cloud',
            advanced: {
                temperature: 0.7,
                max_tokens: 1000,
                timeout: 30,
                retry_count: 3
            }
        });
        setModelType('gpt-3.5-turbo');
        setActiveTab('cloud');
    };

    // 根据选择的云模型更新提供商
    const handleCloudModelChange = (value) => {
        setModelType(value);
        const selectedModel = cloudModelOptions.find(model => model.value === value);
        if (selectedModel) {
            form.setFieldsValue({
                cloud: {
                    ...form.getFieldValue('cloud'),
                    provider: selectedModel.provider
                }
            });
        }
    };

    // 处理标签页切换
    const handleTabChange = (key) => {
        setActiveTab(key);
        form.setFieldsValue({ active_provider: key });
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
                        model: 'gpt-3.5-turbo',
                        provider: 'openai',
                        api_key: '',
                        api_base: '',
                    },
                    ollama: {
                        model: 'llama2',
                        api_url: 'http://localhost:11434',
                    },
                    custom: {
                        model: '',
                        api_url: '',
                        api_key: '',
                    },
                    active_provider: 'cloud',
                    advanced: {
                        temperature: 0.7,
                        max_tokens: 1000,
                        timeout: 30,
                        retry_count: 3
                    }
                }}
            >
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
                >
                    {/* 云服务 LLM 设置 */}
                    <TabPane
                        tab={<><CloudServerOutlined /> 云服务 LLM</>}
                        key="cloud"
                    >
                        <Form.Item
                            name={['cloud', 'model']}
                            label="LLM模型"
                            rules={[{ required: activeTab === 'cloud', message: '请选择LLM模型' }]}
                        >
                            <Select onChange={handleCloudModelChange}>
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
                            <Radio.Group disabled>
                                <Radio.Button value="openai">OpenAI</Radio.Button>
                                <Radio.Button value="anthropic">Anthropic</Radio.Button>
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
                                placeholder="输入API密钥"
                            />
                        </Form.Item>

                        <Form.Item
                            name={['cloud', 'api_base']}
                            label="API基础URL (可选)"
                            tooltip="如果需要使用自定义API服务端点，请在此输入"
                        >
                            <Input
                                placeholder="例如：https://api.openai.com/v1"
                            />
                        </Form.Item>
                    </TabPane>

                    {/* Ollama LLM 设置 */}
                    <TabPane
                        tab={<><DesktopOutlined /> Ollama 本地模型</>}
                        key="ollama"
                    >
                        <Form.Item
                            name={['ollama', 'model']}
                            label="Ollama模型"
                            rules={[{ required: activeTab === 'ollama', message: '请选择Ollama模型' }]}
                        >
                            <Select>
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
                            />
                        </Form.Item>

                        <Alert
                            message="使用Ollama需要在本地或网络可达的服务器上安装并运行Ollama服务"
                            description={
                                <div>
                                    <p>Ollama允许您在本地或私有服务器上运行开源大型语言模型，如Llama、Mistral等。</p>
                                    <p>请访问 <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">Ollama官网</a> 了解如何安装和使用。</p>
                                </div>
                            }
                            type="warning"
                            showIcon
                            style={{ marginTop: '10px' }}
                        />
                    </TabPane>

                    {/* 自定义API设置 */}
                    <TabPane
                        tab={<><ApartmentOutlined /> 自定义API接口</>}
                        key="custom"
                    >
                        <Form.Item
                            name={['custom', 'model']}
                            label="模型名称"
                            tooltip="自定义API服务使用的模型名称"
                            rules={[{ required: activeTab === 'custom', message: '请输入模型名称' }]}
                        >
                            <Input
                                placeholder="例如：gpt-3.5-turbo, llama-7b, text-davinci-003等"
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
                    </TabPane>
                </Tabs>

                <Divider style={{ margin: '16px 0 0 0' }} />

                <Form.Item
                    label="高级设置"
                    style={{ marginBottom: 0, marginTop: '16px' }}
                >
                    <Switch
                        checked={advancedMode}
                        onChange={setAdvancedMode}
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                    />
                </Form.Item>

                {advancedMode && (
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
                )}
            </Form>
        </Modal>
    );
}

export default LLMSettingsModal;