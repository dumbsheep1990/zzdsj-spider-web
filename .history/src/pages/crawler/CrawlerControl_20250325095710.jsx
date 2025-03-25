import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Input,
    InputNumber,
    Switch,
    Card,
    Spin,
    Statistic,
    Typography,
    Space,
    notification,
    Tooltip,
    Collapse,
    Select,
    Row,
    Col,
    Divider,
    Tag,
    Tabs,
    Slider,
    Alert
} from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    QuestionCircleOutlined,
    BugOutlined,
    SettingOutlined,
    DatabaseOutlined,
    LinkOutlined,
    GlobalOutlined,
    PartitionOutlined,
    FilterOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    RobotOutlined,
    ToolOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    ClearOutlined,
    AimOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { crawlerAPI } from '../../api';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// 添加样式组件
const StyledCard = styled(Card)`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    
    .ant-card-head {
        background-color: #f7f9fc;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }
    
    &.url-card {
        border-left: 3px solid #1890ff;
    }
    
    &.advanced-card {
        border-left: 3px solid #722ed1;
    }
    
    &.llm-card {
        border-left: 3px solid #13c2c2;
    }
    
    &.cleaning-card {
        border-left: 3px solid #eb2f96;
    }
    
    &.status-card {
        border-left: 3px solid #52c41a;
    }
`;

const FeatureIcon = styled.div`
    font-size: 18px;
    padding: 8px;
    border-radius: 50%;
    background-color: #e6f7ff;
    color: #1890ff;
    margin-bottom: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
`;

const FeatureItem = styled.div`
    text-align: center;
    padding: 16px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
        background-color: #f0f5ff;
    }
    
    &.selected {
        background-color: #e6f7ff;
    }
`;

function CrawlerControl() {
    const [form] = Form.useForm();
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [startLoading, setStartLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);
    const [useLLM, setUseLLM] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [useDataCleaning, setUseDataCleaning] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState({
        includeSubdomains: true,
        followExternalLinks: false,
        respectRobotsTxt: true,
        handleJavascript: false,
        crawlPagination: false,
        detectDuplicates: true,
        handleLogin: false,
        useProxy: false
    });
    
    const [selectedCleaningFeatures, setSelectedCleaningFeatures] = useState({
        removeHtmlTags: true,
        extractTables: true,
        extractAttachments: true,
        extractImages: true,
        formatText: false,
        removeDuplicates: false,
        standardizeHeaders: false,
        smartTruncate: false
    });
    
    const { settings, setActiveLLMProvider } = useGlobalSettings();

    // 文件格式选项
    const formatOptions = [
        { value: 'json', label: 'JSON', description: '完整的数据结构，包含所有字段' },
        { value: 'csv', label: 'CSV', description: '表格格式，适合在Excel等工具中查看' },
        { value: 'excel', label: 'Excel', description: '直接导出为Excel文件' },
        { value: 'markdown', label: 'Markdown', description: 'Markdown格式，适合文档展示' },
        { value: 'html', label: 'HTML', description: 'HTML格式，保留原始样式' },
        { value: 'txt', label: 'TXT', description: '纯文本格式，仅包含正文内容' }
    ];

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

    // 获取表单当前选择的提供商
    const getCurrentProvider = () => {
        return form.getFieldValue('provider') || settings.llmSettings.activeProvider;
    };

    // 更新选择的爬虫功能
    const updateSelectedFeature = (feature, value) => {
        setSelectedFeatures(prev => ({
            ...prev,
            [feature]: value
        }));
    };
    
    // 更新选择的清洗功能
    const updateSelectedCleaningFeature = (feature, value) => {
        setSelectedCleaningFeatures(prev => ({
            ...prev,
            [feature]: value
        }));
    };
    
    // 功能项渲染 - 爬虫功能
    const renderFeatureItem = (icon, title, description, feature, disabled = false) => (
        <Col span={6}>
            <FeatureItem 
                className={selectedFeatures[feature] ? 'selected' : ''}
                onClick={() => !disabled && updateSelectedFeature(feature, !selectedFeatures[feature])}
            >
                <FeatureIcon>
                    {icon}
                </FeatureIcon>
                <div style={{ marginBottom: 6 }}>
                    <Text strong>{title}</Text>
                    {selectedFeatures[feature] && (
                        <Tag color="blue" style={{ marginLeft: 6 }}>已启用</Tag>
                    )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
            </FeatureItem>
        </Col>
    );
    
    // 功能项渲染 - 清洗功能
    const renderCleaningFeatureItem = (icon, title, description, feature, disabled = false) => (
        <Col span={6}>
            <FeatureItem 
                className={selectedCleaningFeatures[feature] ? 'selected' : ''}
                onClick={() => !disabled && updateSelectedCleaningFeature(feature, !selectedCleaningFeatures[feature])}
            >
                <FeatureIcon>
                    {icon}
                </FeatureIcon>
                <div style={{ marginBottom: 6 }}>
                    <Text strong>{title}</Text>
                    {selectedCleaningFeatures[feature] && (
                        <Tag color="pink" style={{ marginLeft: 6 }}>已启用</Tag>
                    )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
            </FeatureItem>
        </Col>
    );

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // 每3秒刷新一次
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await crawlerAPI.getStatus();
            setStatus(res.data);
            setLoading(false);
        } catch (error) {
            console.error('获取状态失败:', error);
            setLoading(false);
        }
    };

    const onStartCrawler = async (values) => {
        try {
            setStartLoading(true);
            await crawlerAPI.startCrawler(values);
            notification.success({
                message: '爬虫已启动',
                description: '爬虫任务已成功启动，请在仪表盘查看进度。',
            });
            fetchStatus();
            setStartLoading(false);
        } catch (error) {
            console.error('启动爬虫失败:', error);
            notification.error({
                message: '启动失败',
                description: error.response?.data?.detail || '爬虫启动失败，请重试。',
            });
            setStartLoading(false);
        }
    };

    const onStopCrawler = async () => {
        try {
            setStopLoading(true);
            await crawlerAPI.stopCrawler();
            notification.success({
                message: '爬虫已停止',
                description: '爬虫任务已成功停止。',
            });
            fetchStatus();
            setStopLoading(false);
        } catch (error) {
            console.error('停止爬虫失败:', error);
            notification.error({
                message: '停止失败',
                description: error.response?.data?.detail || '爬虫停止失败，请重试。',
            });
            setStopLoading(false);
        }
    };

    const isRunning = status.status === 'running';

    return (
        <div className="crawler-control">
            <Title level={4}>爬虫控制</Title>
            <Paragraph>
                配置和控制爬虫任务，支持使用LLM（大型语言模型）进行内容提取。
            </Paragraph>

            <Card title="爬虫配置" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="crawler_form"
                    initialValues={{
                        base_url: 'https://www.gzlps.gov.cn/',
                        include_subdomains: true,
                        crawl_interval: 1.0,
                        use_llm: false,
                        provider: settings.llmSettings.activeProvider,
                        model: settings.llmSettings[settings.llmSettings.activeProvider]?.model,
                        save_format: 'json'
                    }}
                    onFinish={onStartCrawler}
                    layout="vertical"
                >
                    <Form.Item
                        name="base_url"
                        label="主站URL"
                        rules={[{ required: true, message: '请输入主站URL' }]}
                    >
                        <Input placeholder="请输入主站URL，如 https://www.gzlps.gov.cn/" />
                    </Form.Item>

                    <Form.Item
                        name="include_subdomains"
                        label="包含子站点"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="max_pages"
                        label="最大页面数量 (可选)"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="不限制请留空" />
                    </Form.Item>

                    <Form.Item
                        name="max_depth"
                        label="最大爬取深度 (可选)"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="不限制请留空" />
                    </Form.Item>

                    <Form.Item
                        name="crawl_interval"
                        label="爬取间隔 (秒)"
                        rules={[{ required: true, message: '请输入爬取间隔' }]}
                    >
                        <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="save_format"
                        label={
                            <span>
                                保存格式
                                <Tooltip title="选择爬取数据的保存格式">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            options={formatOptions}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="use_llm"
                        label={
                            <span>
                                使用LLM提取
                                <Tooltip title="启用LLM智能提取可以更精确地识别和提取文章内容">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                        valuePropName="checked"
                    >
                        <Switch onChange={(checked) => setUseLLM(checked)} />
                    </Form.Item>

                    {useLLM && (
                        <>
                            <Form.Item
                                name="provider"
                                label="LLM 提供商"
                                rules={[{ required: useLLM, message: '请选择 LLM 提供商' }]}
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
                                    rules={[{ required: useLLM, message: '请选择 LLM 模型' }]}
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
                        </>
                    )}

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={isRunning}
                                loading={startLoading}
                                icon={<PlayCircleOutlined />}
                            >
                                开始爬取
                            </Button>
                            <Button
                                danger
                                onClick={onStopCrawler}
                                disabled={!isRunning}
                                loading={stopLoading}
                                icon={<PauseCircleOutlined />}
                            >
                                停止爬取
                            </Button>
                            <Button
                                onClick={fetchStatus}
                                icon={<ReloadOutlined />}
                                loading={loading}
                            >
                                刷新状态
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="爬虫状态">
                <Spin spinning={loading}>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <Statistic
                            title="状态"
                            value={status.status === 'running' ? '运行中' :
                                status.status === 'completed' ? '已完成' :
                                    status.status === 'stopped' ? '已停止' :
                                        status.status === 'error' ? '出错' : '未开始'}
                            valueStyle={{ color: status.status === 'running' ? '#1890ff' :
                                    status.status === 'completed' ? '#52c41a' :
                                        status.status === 'error' ? '#f5222d' : '#000000' }}
                        />
                        <Statistic title="已爬取URL数" value={status.visited_urls || 0} />
                        <Statistic title="已发现文章数" value={status.articles_found || 0} />
                    </div>
                    {status.current_url && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>当前正在爬取: </Text>
                            <Text>{status.current_url}</Text>
                        </div>
                    )}
                    {status.error && (
                        <div style={{ marginTop: 16 }}>
                            <Text type="danger" strong>错误信息: </Text>
                            <Text type="danger">{status.error}</Text>
                        </div>
                    )}
                </Spin>
            </Card>

            <Card title="Crawl4AI特性说明" style={{ marginTop: 16 }}>
                <Collapse>
                    <Panel header="LLM智能提取功能" key="1">
                        <Paragraph>
                            启用LLM智能提取后，系统将使用OpenAI API自动识别和提取文章的结构化内容，包括：
                        </Paragraph>
                        <ul>
                            <li>文章标题</li>
                            <li>发布日期</li>
                            <li>发布部门</li>
                            <li>正文内容</li>
                            <li>附件信息</li>
                        </ul>
                        <Paragraph>
                            此功能可以大幅提高提取准确度，特别是对于布局复杂的政府网站，但需要OpenAI API密钥。
                        </Paragraph>
                    </Panel>
                    <Panel header="自动发现子站点" key="2">
                        <Paragraph>
                            Crawl4AI支持智能发现和爬取子站点。启用"包含子站点"选项后，系统将自动识别并爬取所有关联的子站点，确保全面收集数据。
                        </Paragraph>
                    </Panel>
                    <Panel header="智能页面识别" key="3">
                        <Paragraph>
                            系统能够智能识别文章页面，区分文章、列表、栏目等不同类型的页面，确保只提取有价值的文章内容。
                        </Paragraph>
                    </Panel>
                </Collapse>
            </Card>

            <Card title="爬虫说明">
                <Paragraph>
                    爬虫控制功能允许你配置和控制爬虫任务，支持多种数据保存格式和LLM智能提取。
                </Paragraph>
                <Title level={5}>支持的保存格式：</Title>
                <ul>
                    {formatOptions.map(option => (
                        <li key={option.value}>
                            <Text strong>{option.label}</Text>：{option.description}
                        </li>
                    ))}
                </ul>
                <Title level={5}>注意事项：</Title>
                <ul>
                    <li>不同格式的文件大小和保存速度可能有所不同</li>
                    <li>建议根据实际需求选择合适的保存格式</li>
                    <li>使用LLM提取时，建议选择结构化格式（如JSON、CSV）</li>
                </ul>
            </Card>
        </div>
    );
}

export default CrawlerControl;