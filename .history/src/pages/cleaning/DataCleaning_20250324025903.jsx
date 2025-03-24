import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Switch,
    Input,
    Card,
    Spin,
    Typography,
    Space,
    notification,
    Tooltip,
    Collapse,
    Select
} from 'antd';
import {
    DatabaseOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { cleaningAPI } from '../../api';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import StyledCard from '../../components/common/StyledCard';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

function DataCleaning() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [runningCleaning, setRunningCleaning] = useState(false);
    const [useLLMCleaning, setUseLLMCleaning] = useState(false);
    const { settings, setActiveLLMProvider } = useGlobalSettings();

    // LLM提供商选项
    const providerOptions = [
        { label: '云服务 LLM', value: 'cloud' },
        { label: 'Ollama 本地模型', value: 'ollama' },
        { label: '自定义 API', value: 'custom' }
    ];

    // 获取当前选中提供商的模型选项
    const getModelOptions = (provider) => {
        const config = settings.llmSettings[provider];
        switch(provider) {
            case 'cloud':
                return config.models;
            case 'ollama':
                return config.models;
            case 'custom':
                return [];
            default:
                return [];
        }
    };

    // 处理提供商变更
    const handleProviderChange = (value) => {
        setActiveLLMProvider(value);
        const config = settings.llmSettings[value];
        form.setFieldsValue({
            model: config?.model || ''
        });
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setConfigLoading(true);
            const res = await cleaningAPI.getConfig();
            form.setFieldsValue(res.data);
            setUseLLMCleaning(res.data.use_llm_cleaning);
            setConfigLoading(false);
        } catch (error) {
            console.error('获取清洗配置失败:', error);
            setConfigLoading(false);
        }
    };

    const onSaveConfig = async (values) => {
        try {
            setLoading(true);
            await cleaningAPI.saveConfig(values);
            notification.success({
                message: '保存成功',
                description: '数据清洗配置已保存。',
            });
            setLoading(false);
        } catch (error) {
            console.error('保存配置失败:', error);
            notification.error({
                message: '保存失败',
                description: '数据清洗配置保存失败，请重试。',
            });
            setLoading(false);
        }
    };

    const onRunCleaning = async () => {
        try {
            setRunningCleaning(true);
            await cleaningAPI.runCleaning();
            notification.success({
                message: '任务已启动',
                description: '数据清洗任务已成功启动，请等待完成。',
            });
            setRunningCleaning(false);
        } catch (error) {
            console.error('启动清洗任务失败:', error);
            notification.error({
                message: '启动失败',
                description: error.response?.data?.detail || '数据清洗任务启动失败，请重试。',
            });
            setRunningCleaning(false);
        }
    };

    return (
        <div className="data-cleaning">
            <Title level={4}>数据清洗</Title>
            <Paragraph>
                使用 LLM（大型语言模型）智能清洗和优化爬取的数据。
            </Paragraph>

            <StyledCard title="清洗配置">
                <Form
                    form={form}
                    name="cleaning_form"
                    onFinish={onSaveConfig}
                    layout="vertical"
                    initialValues={{
                        remove_html_tags: true,
                        extract_tables: true,
                        extract_attachments: true,
                        extract_images: true,
                        use_llm_cleaning: false,
                        provider: settings.llmSettings.activeProvider,
                        model: settings.llmSettings[settings.llmSettings.activeProvider]?.model
                    }}
                >
                    <Form.Item
                        name="remove_html_tags"
                        label="移除HTML标签"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="extract_tables"
                        label="提取表格"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="extract_attachments"
                        label="提取附件"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="extract_images"
                        label="提取图片"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="use_llm_cleaning"
                        label={
                            <span>
                                使用LLM智能清洗
                                <Tooltip title="启用LLM智能清洗可以更精确地结构化文章内容">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                        valuePropName="checked"
                    >
                        <Switch onChange={(checked) => setUseLLMCleaning(checked)} />
                    </Form.Item>

                    {useLLMCleaning && (
                        <>
                            <Form.Item
                                name="provider"
                                label="LLM 提供商"
                                rules={[{ required: useLLMCleaning, message: '请选择 LLM 提供商' }]}
                            >
                                <Select
                                    placeholder="选择 LLM 提供商"
                                    options={providerOptions}
                                    onChange={handleProviderChange}
                                />
                            </Form.Item>

                            <Form.Item
                                name="model"
                                label="LLM 模型"
                                rules={[{ required: useLLMCleaning, message: '请选择 LLM 模型' }]}
                            >
                                <Select
                                    placeholder="选择 LLM 模型"
                                    options={getModelOptions(form.getFieldValue('provider'))}
                                    disabled={form.getFieldValue('provider') === 'custom'}
                                />
                            </Form.Item>

                            {form.getFieldValue('provider') === 'custom' && (
                                <>
                                    <Form.Item
                                        name={['custom', 'model']}
                                        label="自定义模型名称"
                                        rules={[{ required: true, message: '请输入模型名称' }]}
                                    >
                                        <Input placeholder="例如：gpt-3.5-turbo, llama-7b" />
                                    </Form.Item>
                                    <Form.Item
                                        name={['custom', 'apiUrl']}
                                        label="API 接口地址"
                                        rules={[{ required: true, message: '请输入API接口地址' }]}
                                    >
                                        <Input placeholder="例如：https://your-api-server.com/v1/chat/completions" />
                                    </Form.Item>
                                    <Form.Item
                                        name={['custom', 'apiKey']}
                                        label="API 密钥"
                                    >
                                        <Input.Password placeholder="如果需要，请输入API密钥" />
                                    </Form.Item>
                                </>
                            )}
                        </>
                    )}

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                保存配置
                            </Button>
                            <Button
                                type="default"
                                onClick={fetchConfig}
                            >
                                重置配置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </StyledCard>

            <StyledCard title="清洗结果">
                <Paragraph>
                    数据清洗将根据上面的配置对已爬取的文章进行处理。如果启用了LLM智能清洗，系统将使用OpenAI API对文章内容进行智能结构化和清洗。
                </Paragraph>
                <Paragraph type="warning">
                    注意：数据清洗任务会在后台运行，可能需要一些时间，取决于文章数量。
                </Paragraph>
                <Button
                    type="primary"
                    onClick={onRunCleaning}
                    loading={runningCleaning}
                    icon={<DatabaseOutlined />}
                >
                    开始数据清洗
                </Button>
            </StyledCard>

            <Card title="LLM智能清洗说明" style={{ marginTop: 16 }}>
                <Collapse>
                    <Panel header="LLM智能清洗功能" key="1">
                        <Paragraph>
                            启用LLM智能清洗后，系统将使用OpenAI API对文章内容进行全面分析和结构化，包括：
                        </Paragraph>
                        <ul>
                            <li>去除无关内容和广告</li>
                            <li>修正错误格式</li>
                            <li>提取并结构化表格数据</li>
                            <li>识别并标记政策要点</li>
                            <li>整理文章段落结构</li>
                        </ul>
                        <Paragraph>
                            LLM智能清洗能够显著提高内容质量，使政府文章更易阅读和分析。
                        </Paragraph>
                    </Panel>
                    <Panel header="自定义清洗规则" key="2">
                        <Paragraph>
                            系统支持添加自定义清洗规则，可以针对特定网站或内容格式定制专属的清洗方案。
                        </Paragraph>
                    </Panel>
                    <Panel header="传统清洗功能" key="3">
                        <Paragraph>
                            即使不使用LLM智能清洗，系统也支持多种传统清洗功能：
                        </Paragraph>
                        <ul>
                            <li>HTML标签移除</li>
                            <li>表格结构提取</li>
                            <li>附件和图片识别</li>
                            <li>正则表达式替换</li>
                        </ul>
                    </Panel>
                </Collapse>
            </Card>
        </div>
    );
}

export default DataCleaning;