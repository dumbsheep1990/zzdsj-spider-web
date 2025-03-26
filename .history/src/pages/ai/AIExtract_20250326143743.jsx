import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Input,
    Radio,
    Card,
    Tabs,
    Typography,
    Space,
    Tag,
    List,
    Divider,
    notification,
    Collapse,
    Select,
    Upload,
    Progress,
    Table,
    Modal,
    Tooltip,
    Badge,
    Statistic,
    Row,
    Col
} from 'antd';
import {
    RobotOutlined,
    UploadOutlined,
    HistoryOutlined,
    SaveOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ReloadOutlined,
    PlusOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { aiAPI } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Dragger } = Upload;

function AIExtract() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [extractedContent, setExtractedContent] = useState(null);
    const [extractMode, setExtractMode] = useState('url');
    const [activeTab, setActiveTab] = useState('extract');
    const [templates, setTemplates] = useState([]);
    const [history, setHistory] = useState([]);
    const [batchProgress, setBatchProgress] = useState(null);
    const [batchResults, setBatchResults] = useState([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateForm] = Form.useForm();
    const { settings, setActiveLLMProvider } = useGlobalSettings();

    // 获取提取模板
    const fetchTemplates = async () => {
        try {
            const response = await aiAPI.getExtractTemplates();
            setTemplates(response.data);
        } catch (error) {
            console.error('获取模板失败:', error);
        }
    };

    // 获取提取历史
    const fetchHistory = async () => {
        try {
            const response = await aiAPI.getExtractHistory();
            setHistory(response.data);
        } catch (error) {
            console.error('获取历史失败:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchHistory();
    }, []);

    // LLM提供商选项
    const providerOptions = [
        { label: '云服务 LLM', value: 'cloud' },
        { label: 'Ollama 本地模型', value: 'ollama' },
        { label: '自定义 API', value: 'custom' }
    ];

    // 获取当前选中提供商的模型选项
    const getModelOptions = (provider) => {
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

    // 处理提供商变更
    const handleProviderChange = (value) => {
        setActiveLLMProvider(value);
        const config = settings.llmSettings[value];
        form.setFieldsValue({
            model: config?.model || undefined
        });
    };

    const onSubmitExtract = async (values) => {
        try {
            setLoading(true);

            const params = {
                instructions: values.instructions,
                llm_config: {
                    provider: values.provider,
                    model: values.model,
                    ...(values.provider === 'custom' ? values.custom : {})
                }
            };

            let response;
            if (extractMode === 'url') {
                response = await aiAPI.extractFromUrl({
                    ...params,
                    url: values.url
                });
            } else {
                response = await aiAPI.extractFromHtml({
                    ...params,
                    html_content: values.html_content
                });
            }

            setExtractedContent(response.data);
            notification.success({
                message: '提取成功',
                description: '内容已成功提取并结构化。',
            });

            // 刷新历史记录
            fetchHistory();
        } catch (error) {
            console.error('AI提取失败:', error);
            notification.error({
                message: '提取失败',
                description: error.response?.data?.detail || 'AI内容提取失败，请重试。',
            });
        } finally {
            setLoading(false);
        }
    };

    // 保存提取模板
    const handleSaveTemplate = async () => {
        try {
            const values = await templateForm.validateFields();
            await aiAPI.saveExtractTemplate(values);
            notification.success({
                message: '保存成功',
                description: '提取模板已保存。',
            });
            setShowTemplateModal(false);
            fetchTemplates();
        } catch (error) {
            console.error('保存模板失败:', error);
            notification.error({
                message: '保存失败',
                description: error.response?.data?.detail || '保存模板失败，请重试。',
            });
        }
    };

    // 删除提取模板
    const handleDeleteTemplate = async (templateId) => {
        try {
            await aiAPI.deleteExtractTemplate(templateId);
            notification.success({
                message: '删除成功',
                description: '提取模板已删除。',
            });
            fetchTemplates();
        } catch (error) {
            console.error('删除模板失败:', error);
            notification.error({
                message: '删除失败',
                description: error.response?.data?.detail || '删除模板失败，请重试。',
            });
        }
    };

    // 批量提取
    const handleBatchExtract = async (file) => {
        try {
            const response = await aiAPI.batchExtract({
                file: file,
                instructions: form.getFieldValue('instructions'),
                llm_config: {
                    provider: form.getFieldValue('provider'),
                    model: form.getFieldValue('model'),
                    ...(form.getFieldValue('provider') === 'custom' ? form.getFieldValue('custom') : {})
                }
            });

            const taskId = response.data.task_id;
            setBatchProgress({ taskId, status: 'processing', progress: 0 });

            // 开始轮询进度
            const pollProgress = setInterval(async () => {
                const progressResponse = await aiAPI.getBatchProgress(taskId);
                const progress = progressResponse.data;

                if (progress.status === 'completed') {
                    clearInterval(pollProgress);
                    setBatchProgress({ ...progress, status: 'completed' });
                    const resultsResponse = await aiAPI.getBatchResults(taskId);
                    setBatchResults(resultsResponse.data);
                } else if (progress.status === 'failed') {
                    clearInterval(pollProgress);
                    setBatchProgress({ ...progress, status: 'failed' });
                    notification.error({
                        message: '批量提取失败',
                        description: progress.error || '批量提取过程中发生错误。',
                    });
                } else {
                    setBatchProgress({ ...progress, status: 'processing' });
                }
            }, 2000);

            return false; // 阻止自动上传
        } catch (error) {
            console.error('批量提取失败:', error);
            notification.error({
                message: '批量提取失败',
                description: error.response?.data?.detail || '批量提取失败，请重试。',
            });
            return false;
        }
    };

    // 导出结果
    const handleExport = async () => {
        try {
            const response = await aiAPI.exportResults({
                content: extractedContent,
                format: 'json'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'extract_results.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('导出失败:', error);
            notification.error({
                message: '导出失败',
                description: error.response?.data?.detail || '导出失败，请重试。',
            });
        }
    };

    // 获取表单当前选择的提供商
    const getCurrentProvider = () => {
        return form.getFieldValue('provider') || settings.llmSettings.activeProvider;
    };

    // 历史记录列定义
    const historyColumns = [
        {
            title: '提取时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: '提取方式',
            dataIndex: 'mode',
            key: 'mode',
            render: (text) => (
                <Tag color={text === 'url' ? 'blue' : 'green'}>
                    {text === 'url' ? 'URL提取' : 'HTML提取'}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <Badge
                    status={text === 'success' ? 'success' : 'error'}
                    text={text === 'success' ? '成功' : '失败'}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => setExtractedContent(record.result)}
                    >
                        查看结果
                    </Button>
                    <Button
                        type="link"
                        onClick={() => handleExport(record.result)}
                    >
                        导出
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="ai-extract">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>
                                <RobotOutlined /> AI内容提取
                            </Title>
                            <Text type="secondary">
                                使用大型语言模型(LLM)智能提取和结构化网页内容
                            </Text>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={16}>
                    <Card>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                {
                                    key: 'extract',
                                    label: '内容提取',
                                    children: (
                                        <Form
                                            form={form}
                                            name="ai_extract_form"
                                            onFinish={onSubmitExtract}
                                            layout="vertical"
                                            initialValues={{
                                                url: '',
                                                html_content: '',
                                                instructions: '提取政府文章的标题、发布日期、发布部门、正文内容，并识别关键政策点。',
                                                provider: settings.llmSettings.activeProvider,
                                                model: settings.llmSettings[settings.llmSettings.activeProvider]?.model
                                            }}
                                        >
                                            <Form.Item label="提取方式">
                                                <Radio.Group value={extractMode} onChange={e => setExtractMode(e.target.value)}>
                                                    <Radio.Button value="url">从URL提取</Radio.Button>
                                                    <Radio.Button value="html">从HTML提取</Radio.Button>
                                                </Radio.Group>
                                            </Form.Item>

                                            {extractMode === 'url' ? (
                                                <Form.Item
                                                    name="url"
                                                    label="网页URL"
                                                    rules={[{ required: extractMode === 'url', message: '请输入网页URL' }]}
                                                >
                                                    <Input placeholder="请输入要提取内容的网页URL" />
                                                </Form.Item>
                                            ) : (
                                                <Form.Item
                                                    name="html_content"
                                                    label="HTML内容"
                                                    rules={[{ required: extractMode === 'html', message: '请输入HTML内容' }]}
                                                >
                                                    <TextArea rows={6} placeholder="请粘贴HTML内容" />
                                                </Form.Item>
                                            )}

                                            <Form.Item
                                                name="instructions"
                                                label="提取指令"
                                                tooltip="告诉AI需要提取什么内容，越具体效果越好"
                                            >
                                                <TextArea
                                                    rows={4}
                                                    placeholder="例如：提取政府文章的标题、发布日期、作者和主要内容，识别政策要点"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="provider"
                                                label="LLM 提供商"
                                                rules={[{ required: true, message: '请选择 LLM 提供商' }]}
                                            >
                                                <Select
                                                    placeholder="选择 LLM 提供商"
                                                    options={providerOptions}
                                                    onChange={handleProviderChange}
                                                />
                                            </Form.Item>

                                            {getCurrentProvider() !== 'custom' && (
                                                <Form.Item
                                                    name="model"
                                                    label="LLM 模型"
                                                    rules={[{ required: true, message: '请选择 LLM 模型' }]}
                                                >
                                                    <Select
                                                        placeholder="选择 LLM 模型"
                                                        options={getModelOptions(getCurrentProvider())}
                                                    />
                                                </Form.Item>
                                            )}

                                            {getCurrentProvider() === 'custom' && (
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

                                            <Form.Item>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        loading={loading}
                                                        icon={<RobotOutlined />}
                                                    >
                                                        开始提取
                                                    </Button>
                                                    <Button
                                                        icon={<SaveOutlined />}
                                                        onClick={() => setShowTemplateModal(true)}
                                                    >
                                                        保存为模板
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    )
                                },
                                {
                                    key: 'batch',
                                    label: '批量提取',
                                    children: (
                                        <div>
                                            <Dragger
                                                accept=".txt,.csv"
                                                beforeUpload={handleBatchExtract}
                                                showUploadList={false}
                                            >
                                                <p className="ant-upload-drag-icon">
                                                    <UploadOutlined />
                                                </p>
                                                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                                                <p className="ant-upload-hint">
                                                    支持 .txt 或 .csv 文件，每行一个URL
                                                </p>
                                            </Dragger>

                                            {batchProgress && (
                                                <Card style={{ marginTop: 16 }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Space>
                                                            <Text>批量提取进度</Text>
                                                            {batchProgress.status === 'processing' && (
                                                                <LoadingOutlined />
                                                            )}
                                                            {batchProgress.status === 'completed' && (
                                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                            )}
                                                            {batchProgress.status === 'failed' && (
                                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                            )}
                                                        </Space>
                                                        <Progress
                                                            percent={batchProgress.progress}
                                                            status={
                                                                batchProgress.status === 'completed'
                                                                    ? 'success'
                                                                    : batchProgress.status === 'failed'
                                                                    ? 'exception'
                                                                    : 'active'
                                                            }
                                                        />
                                                    </Space>
                                                </Card>
                                            )}

                                            {batchResults.length > 0 && (
                                                <Card style={{ marginTop: 16 }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Space>
                                                            <Text>提取结果</Text>
                                                            <Button
                                                                type="link"
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => handleExport(batchResults)}
                                                            >
                                                                导出结果
                                                            </Button>
                                                        </Space>
                                                        <Table
                                                            dataSource={batchResults}
                                                            columns={[
                                                                {
                                                                    title: 'URL',
                                                                    dataIndex: 'url',
                                                                    key: 'url',
                                                                    ellipsis: true
                                                                },
                                                                {
                                                                    title: '状态',
                                                                    dataIndex: 'status',
                                                                    key: 'status',
                                                                    render: (text) => (
                                                                        <Badge
                                                                            status={text === 'success' ? 'success' : 'error'}
                                                                            text={text === 'success' ? '成功' : '失败'}
                                                                        />
                                                                    )
                                                                },
                                                                {
                                                                    title: '操作',
                                                                    key: 'action',
                                                                    render: (_, record) => (
                                                                        <Button
                                                                            type="link"
                                                                            onClick={() => setExtractedContent(record.result)}
                                                                        >
                                                                            查看结果
                                                                        </Button>
                                                                    )
                                                                }
                                                            ]}
                                                        />
                                                    </Space>
                                                </Card>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'history',
                                    label: '提取历史',
                                    children: (
                                        <Table
                                            dataSource={history}
                                            columns={historyColumns}
                                            rowKey="id"
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="提取模板">
                        <List
                            dataSource={templates}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                form.setFieldsValue({
                                                    instructions: item.instructions,
                                                    provider: item.llm_config.provider,
                                                    model: item.llm_config.model,
                                                    custom: item.llm_config.custom
                                                });
                                            }}
                                        >
                                            使用
                                        </Button>,
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteTemplate(item.id)}
                                        >
                                            删除
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={item.name}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card title="使用说明" style={{ marginTop: 16 }}>
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="LLM智能提取原理" key="1">
                                <Paragraph>
                                    LLM智能提取使用大型语言模型(如GPT-3.5/GPT-4)分析网页内容，能够智能理解页面结构和语义，
                                    从复杂的HTML中准确提取所需信息并结构化，大幅超越传统爬虫的能力。
                                </Paragraph>
                            </Panel>
                            <Panel header="编写有效的提取指令" key="2">
                                <Paragraph>
                                    高质量的提取指令可以显著提高提取质量。有效的指令应当：
                                </Paragraph>
                                <ul>
                                    <li>明确指定需要提取的字段（如标题、日期、作者等）</li>
                                    <li>说明内容的预期格式</li>
                                    <li>提供特定领域的上下文（例如，这是政府文章）</li>
                                    <li>指出需要忽略的内容（如页面导航、广告等）</li>
                                </ul>
                            </Panel>
                            <Panel header="Crawl4AI内容提取优势" key="3">
                                <Paragraph>
                                    Crawl4AI的LLM内容提取具有以下优势：
                                </Paragraph>
                                <ul>
                                    <li>适应各种网页结构，无需手动编写选择器</li>
                                    <li>能够理解文本语义，提取隐含信息</li>
                                    <li>自动识别和结构化表格、列表等复杂内容</li>
                                    <li>可提取关键要点和政策信息</li>
                                    <li>支持自定义提取规则和输出格式</li>
                                </ul>
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>
            </Row>

            {extractedContent && (
                <Card style={{ marginTop: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Title level={5} style={{ margin: 0 }}>提取结果</Title>
                            <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                            >
                                导出结果
                            </Button>
                        </Space>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="结构化内容" key="1">
                                <div style={{ marginBottom: 16 }}>
                                    <Title level={5}>{extractedContent.title}</Title>
                                    <Space split={<Divider type="vertical" />}>
                                        {extractedContent.publish_date && (
                                            <Text type="secondary">发布日期: {extractedContent.publish_date}</Text>
                                        )}
                                        {extractedContent.department && (
                                            <Text type="secondary">发布部门: {extractedContent.department}</Text>
                                        )}
                                    </Space>
                                </div>

                                <Divider orientation="left">正文内容</Divider>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {extractedContent.content}
                                </div>

                                {extractedContent.key_points && extractedContent.key_points.length > 0 && (
                                    <>
                                        <Divider orientation="left">关键要点</Divider>
                                        <List
                                            bordered
                                            dataSource={extractedContent.key_points}
                                            renderItem={(item, index) => (
                                                <List.Item>
                                                    <Text mark>[{index+1}]</Text> {item}
                                                </List.Item>
                                            )}
                                        />
                                    </>
                                )}

                                {extractedContent.attachments && extractedContent.attachments.length > 0 && (
                                    <>
                                        <Divider orientation="left">附件</Divider>
                                        <List
                                            bordered
                                            dataSource={extractedContent.attachments}
                                            renderItem={item => (
                                                <List.Item>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                        {item.name}
                                                    </a>
                                                </List.Item>
                                            )}
                                        />
                                    </>
                                )}
                            </TabPane>

                            <TabPane tab="JSON格式" key="2">
                                <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                                    <pre>{JSON.stringify(extractedContent, null, 2)}</pre>
                                </div>
                            </TabPane>
                        </Tabs>
                    </Space>
                </Card>
            )}

            <Modal
                title="保存提取模板"
                open={showTemplateModal}
                onOk={handleSaveTemplate}
                onCancel={() => setShowTemplateModal(false)}
            >
                <Form
                    form={templateForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="模板名称"
                        rules={[{ required: true, message: '请输入模板名称' }]}
                    >
                        <Input placeholder="请输入模板名称" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="模板描述"
                    >
                        <TextArea rows={3} placeholder="请输入模板描述" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default AIExtract;