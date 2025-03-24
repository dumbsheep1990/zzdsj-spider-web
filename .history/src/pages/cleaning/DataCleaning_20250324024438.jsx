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

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

function DataCleaning() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [runningCleaning, setRunningCleaning] = useState(false);
    const [useLLMCleaning, setUseLLMCleaning] = useState(false);
    const { settings } = useGlobalSettings();

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

    // 获取当前可用的 LLM 选项
    const getLLMOptions = () => {
        const options = [];
        
        // 云服务选项
        if (settings.llmSettings?.cloud?.model) {
            options.push({
                label: 'OpenAI',
                options: [
                    { label: 'GPT-3.5 Turbo', value: 'openai/gpt-3.5-turbo' },
                    { label: 'GPT-4', value: 'openai/gpt-4' },
                    { label: 'GPT-4 Turbo', value: 'openai/gpt-4-turbo' }
                ]
            });
            options.push({
                label: 'Anthropic',
                options: [
                    { label: 'Claude 3 Haiku', value: 'anthropic/claude-3-haiku' },
                    { label: 'Claude 3 Sonnet', value: 'anthropic/claude-3-sonnet' },
                    { label: 'Claude 3 Opus', value: 'anthropic/claude-3-opus' }
                ]
            });
        }

        // Ollama 选项
        if (settings.llmSettings?.ollama?.model) {
            options.push({
                label: 'Ollama (本地)',
                options: [
                    { label: 'Llama 2', value: 'ollama/llama2' },
                    { label: 'Mistral', value: 'ollama/mistral' },
                    { label: 'Phi-2', value: 'ollama/phi' }
                ]
            });
        }

        return options;
    };

    return (
        <div className="data-cleaning">
            <Title level={4}>数据清洗</Title>
            <Paragraph>
                配置和执行数据清洗任务，支持使用LLM智能清洗，提高清洗质量。
            </Paragraph>

            <Card title="数据清洗配置" style={{ marginBottom: 16 }}>
                <Spin spinning={configLoading}>
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
                            custom_rules: {},
                            llm_config: 'openai/gpt-3.5-turbo'
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
                            <Form.Item
                                name="llm_config"
                                label="LLM 模型选择"
                                tooltip="选择用于内容清洗的语言模型"
                                rules={[{ required: useLLMCleaning, message: '请选择LLM模型' }]}
                            >
                                <Select
                                    placeholder="选择LLM模型"
                                    options={getLLMOptions()}
                                />
                            </Form.Item>
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
                </Spin>
            </Card>

            <Card title="执行数据清洗">
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
            </Card>

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