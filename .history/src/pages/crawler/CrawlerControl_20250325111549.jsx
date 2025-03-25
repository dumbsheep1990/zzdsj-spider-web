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
    DashboardOutlined,
    TableOutlined,
    BulbOutlined
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
            
            // 处理多行URL输入
            let urls = [];
            if (values.base_url) {
                urls = values.base_url.split('\n').filter(url => url.trim() !== '').map(url => url.trim());
            }
            
            // 将选中功能添加到提交数据中
            const crawlerData = {
                ...values,
                base_url: urls.length === 1 ? urls[0] : urls, // 如果只有一个URL，保持原始格式，否则提交数组
                include_subdomains: selectedFeatures.includeSubdomains,
                follow_external_links: selectedFeatures.followExternalLinks,
                respect_robots_txt: selectedFeatures.respectRobotsTxt,
                handle_javascript: selectedFeatures.handleJavascript,
                crawl_pagination: selectedFeatures.crawlPagination,
                detect_duplicates: selectedFeatures.detectDuplicates,
                handle_login: selectedFeatures.handleLogin,
                use_proxy: selectedFeatures.useProxy,
                use_data_cleaning: useDataCleaning,
                url_file_path: values.url_file_path || ''
            };
            
            // 如果启用了数据清洗，添加清洗配置
            if (useDataCleaning) {
                crawlerData.cleaning_config = {
                    remove_html_tags: selectedCleaningFeatures.removeHtmlTags,
                    extract_tables: selectedCleaningFeatures.extractTables,
                    extract_attachments: selectedCleaningFeatures.extractAttachments,
                    extract_images: selectedCleaningFeatures.extractImages,
                    format_text: selectedCleaningFeatures.formatText,
                    remove_duplicates: selectedCleaningFeatures.removeDuplicates,
                    standardize_headers: selectedCleaningFeatures.standardizeHeaders,
                    smart_truncate: selectedCleaningFeatures.smartTruncate,
                    advanced_settings: values.advancedSettings || {},
                    use_llm_cleaning: values.use_llm_cleaning || false,
                    llm_settings: values.llmSettings || {}
                };
            }
            
            // 启动爬虫
            if (crawlerData.url_file_path) {
                // 如果有文件路径，使用文件导入API
                await crawlerAPI.startCrawlerWithFile(crawlerData);
                notification.success({
                    message: '文件导入成功',
                    description: `已从文件导入URLs，爬虫任务已成功启动，请在仪表盘查看进度。`,
                    icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />
                });
            } else {
                // 否则使用普通启动API
                await crawlerAPI.startCrawler(crawlerData);
                notification.success({
                    message: '爬虫已启动',
                    description: '爬虫任务已成功启动，请在仪表盘查看进度。',
                    icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />
                });
            }
            
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
            <Title level={4}>
                <BugOutlined /> 爬虫控制
            </Title>
            <Paragraph>
                配置和控制爬虫任务，支持高级爬取功能和LLM内容处理，可在爬取过程中自动进行数据清洗。
            </Paragraph>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane 
                    tab={<span><SettingOutlined /> 爬虫配置</span>} 
                    key="basic"
                >
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
                            save_format: 'json',
                            advanced: {
                                request_timeout: 30,
                                max_retries: 3,
                                concurrency: 1,
                                user_agent: 'Crawl4AI Spider'
                            }
                        }}
                        onFinish={onStartCrawler}
                        layout="vertical"
                    >
                        {/* 基础URL配置 */}
                        <StyledCard 
                            title={<><LinkOutlined /> 基础URL配置</>} 
                            className="url-card"
                            extra={<Text type="secondary">配置爬虫目标和基本参数</Text>}
                        >
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Form.Item
                                        name="base_url"
                                        label="主站URL"
                                        rules={[{ required: true, message: '请输入主站URL' }]}
                                        tooltip="支持输入多个URL，一行一个URL地址"
                                    >
                                        <Input.TextArea 
                                            placeholder="请输入主站URL，多个URL请一行一个，如 https://www.gzlps.gov.cn/" 
                                            autoSize={{ minRows: 2, maxRows: 6 }}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="crawl_interval"
                                        label="爬取间隔 (秒)"
                                        rules={[{ required: true, message: '请输入爬取间隔' }]}
                                    >
                                        <InputNumber 
                                            min={0.1} 
                                            max={10}
                                            step={0.1} 
                                            style={{ width: '100%', height: '38px' }} 
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="url_file"
                                        label={
                                            <span>
                                                URL文件导入
                                                <Tooltip title="上传Excel或CSV文件以批量导入URL">
                                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                                </Tooltip>
                                            </span>
                                        }
                                    >
                                        <Input.Group compact>
                                            <Form.Item
                                                name="url_file_path"
                                                noStyle
                                            >
                                                <Input 
                                                    style={{ width: 'calc(100% - 135px)', height: '38px' }} 
                                                    placeholder="Excel或CSV文件地址，留空则不使用"
                                                    addonBefore={<FileTextOutlined />}
                                                />
                                            </Form.Item>
                                            <Button 
                                                type="primary" 
                                                style={{ width: '135px', height: '38px' }}
                                                onClick={() => {
                                                    // 打开文件选择对话框
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = '.xlsx,.xls,.csv';
                                                    input.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            form.setFieldsValue({
                                                                url_file_path: file.path
                                                            });
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                选择文件
                                            </Button>
                                        </Input.Group>
                                        <div style={{ marginTop: 8 }}>
                                            <Text type="secondary">
                                                支持 .xlsx, .xls, .csv 格式，第一列需为URL地址
                                            </Text>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="max_pages"
                                        label="最大页面数量 (可选)"
                                    >
                                        <InputNumber
                                            min={1}
                                            max={10000}
                                            placeholder="不限制请留空"
                                            style={{ width: '100%', height: '38px' }} 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="max_depth"
                                        label="最大爬取深度 (可选)"
                                    >
                                        <InputNumber
                                            min={1}
                                            max={100}
                                            placeholder="不限制请留空"
                                            style={{ width: '100%', height: '38px' }} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
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
                                    style={{ width: '100%', height: '38px' }}
                                />
                            </Form.Item>
                        </StyledCard>
                        
                        {/* 爬虫功能 */}
                        <StyledCard 
                            title={<><ToolOutlined /> 爬虫功能</>} 
                            className="advanced-card"
                            extra={<Text type="secondary">选择要启用的爬虫功能</Text>}
                        >
                            <Row gutter={[16, 16]}>
                                {renderFeatureItem(<GlobalOutlined />, '包含子站点', '爬取同域名下的子站点', 'includeSubdomains')}
                                {renderFeatureItem(<LinkOutlined />, '跟随外部链接', '爬取指向外部网站的链接', 'followExternalLinks')}
                                {renderFeatureItem(<FileTextOutlined />, '遵循Robots.txt', '遵循网站robots.txt规则', 'respectRobotsTxt')}
                                {renderFeatureItem(<AimOutlined />, '处理Javascript', '使用浏览器引擎执行JS后爬取', 'handleJavascript')}
                            </Row>
                            
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                {renderFeatureItem(<PartitionOutlined />, '爬取分页', '智能识别并爬取分页内容', 'crawlPagination')}
                                {renderFeatureItem(<FilterOutlined />, '检测重复', '避免重复爬取相同内容', 'detectDuplicates')}
                                {renderFeatureItem(<SettingOutlined />, '处理登录', '支持表单登录后爬取', 'handleLogin')}
                                {renderFeatureItem(<GlobalOutlined />, '使用代理', '使用代理IP轮换爬取', 'useProxy')}
                            </Row>

                            <Divider orientation="left">高级设置</Divider>
                            
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item
                                        name={['advanced', 'request_timeout']}
                                        label="请求超时 (秒)"
                                    >
                                        <InputNumber min={5} max={120} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['advanced', 'max_retries']}
                                        label="重试次数"
                                    >
                                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['advanced', 'concurrency']}
                                        label="并发数"
                                    >
                                        <InputNumber min={1} max={10} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name={['advanced', 'user_agent']}
                                        label="User Agent"
                                    >
                                        <Input placeholder="自定义User Agent" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </StyledCard>
                        
                        {/* LLM提取 */}
                        <StyledCard 
                            title={<><RobotOutlined /> LLM内容提取</>} 
                            className="llm-card"
                            extra={
                                <Switch
                                    checked={useLLM}
                                    onChange={(checked) => setUseLLM(checked)}
                                />
                            }
                        >
                            {!useLLM ? (
                                <Alert
                                    message="LLM内容提取未启用"
                                    description="启用LLM内容提取可以更准确地从网页中提取结构化内容，识别标题、正文、表格等关键信息。"
                                    type="info"
                                    showIcon
                                    action={
                                        <Button size="small" type="primary" onClick={() => setUseLLM(true)}>
                                            启用
                                        </Button>
                                    }
                                />
                            ) : (
                                <>
                                    <Form.Item
                                        name="use_llm"
                                        hidden
                                        initialValue={true}
                                        valuePropName="checked"
                                    >
                                        <Switch checked={true} />
                                    </Form.Item>
                                    
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
                                    
                                    <Divider orientation="left">LLM参数设置</Divider>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name={['llm_settings', 'temperature']}
                                                label="温度参数"
                                                tooltip="控制生成文本的随机性，值越低结果越确定"
                                                initialValue={0.3}
                                            >
                                                <Slider min={0} max={1} step={0.1} marks={{ 0: '精确', 0.5: '平衡', 1: '创意' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name={['llm_settings', 'max_tokens']}
                                                label="最大输出长度"
                                                tooltip="限制LLM一次处理的最大长度"
                                                initialValue={1000}
                                            >
                                                <InputNumber min={100} max={8000} step={100} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Item
                                        name={['llm_settings', 'prompt_template']}
                                        label="提示词模板"
                                        tooltip="自定义给LLM的指令，用于指导模型如何提取内容"
                                        initialValue="从网页内容中提取关键信息，包括标题、正文内容、表格数据和重要的政策信息。去除导航栏、广告、侧边栏等无关内容。"
                                    >
                                        <Input.TextArea rows={3} placeholder="输入提取提示词模板..." />
                                    </Form.Item>
                                </>
                            )}
                        </StyledCard>
                        
                        {/* 数据清洗配置 */}
                        <StyledCard 
                            title={<><ClearOutlined /> 数据清洗配置</>} 
                            className="cleaning-card"
                            extra={
                                <Switch
                                    checked={useDataCleaning}
                                    onChange={(checked) => setUseDataCleaning(checked)}
                                />
                            }
                        >
                            {!useDataCleaning ? (
                                <Alert
                                    message="爬取时数据清洗未启用"
                                    description="启用此功能可在爬取过程中自动对内容进行清洗和结构化，提高数据质量。"
                                    type="info"
                                    showIcon
                                    action={
                                        <Button size="small" type="primary" onClick={() => setUseDataCleaning(true)}>
                                            启用
                                        </Button>
                                    }
                                />
                            ) : (
                                <>
                                    <Form.Item
                                        name="use_data_cleaning"
                                        hidden
                                        initialValue={true}
                                        valuePropName="checked"
                                    >
                                        <Switch checked={true} />
                                    </Form.Item>
                                    
                                    <Row gutter={[16, 16]}>
                                        {renderCleaningFeatureItem(<FileTextOutlined />, '移除HTML标签', '清理文本中的HTML标签，只保留纯文本内容', 'removeHtmlTags')}
                                        {renderCleaningFeatureItem(<TableOutlined />, '提取表格', '识别并提取文本中的表格，保留结构化数据', 'extractTables')}
                                        {renderCleaningFeatureItem(<FileTextOutlined />, '提取附件', '提取并保存文档中的附件', 'extractAttachments')}
                                        {renderCleaningFeatureItem(<FileTextOutlined />, '提取图片', '提取文章中的图片资源', 'extractImages')}
                                    </Row>
                                
                                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                        {renderCleaningFeatureItem(<FilterOutlined />, '格式化文本', '标准化段落格式，保证一致性', 'formatText')}
                                        {renderCleaningFeatureItem(<FilterOutlined />, '去除重复内容', '识别并移除重复的段落和内容', 'removeDuplicates')}
                                        {renderCleaningFeatureItem(<FileTextOutlined />, '标准化标题', '统一文档标题格式，规范层级关系', 'standardizeHeaders')}
                                        {renderCleaningFeatureItem(<BulbOutlined />, '智能截断', '根据内容关联性智能截断超长文本', 'smartTruncate')}
                                    </Row>
                                    
                                    <Divider orientation="left">高级清洗设置</Divider>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name={['advancedSettings', 'minContentLength']}
                                                label="最小内容长度"
                                                tooltip="少于此长度的内容将被视为无效"
                                                initialValue={100}
                                            >
                                                <InputNumber min={10} max={1000} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name={['advancedSettings', 'duplicateThreshold']}
                                                label="重复内容阈值"
                                                tooltip="相似度超过此值的内容将被视为重复"
                                                initialValue={0.8}
                                            >
                                                <Slider min={0} max={1} step={0.05} marks={{ 0: '低', 0.5: '中', 1: '高' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Item
                                        name="use_llm_cleaning"
                                        label={
                                            <span>
                                                使用LLM智能清洗
                                                <Tooltip title="利用LLM进行更精细的内容清洗和结构化">
                                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                                </Tooltip>
                                            </span>
                                        }
                                        valuePropName="checked"
                                        initialValue={false}
                                    >
                                        <Switch />
                                    </Form.Item>
                                </>
                            )}
                        </StyledCard>
                        
                        <Row justify="space-between" style={{ marginTop: 24 }}>
                            <Col>
                                <Button
                                    type="default"
                                    icon={<ReloadOutlined />}
                                    onClick={() => form.resetFields()}
                                >
                                    重置配置
                                </Button>
                            </Col>
                            <Col>
                                <Space>
                                    {isRunning && (
                                        <Button
                                            type="danger"
                                            icon={<PauseCircleOutlined />}
                                            onClick={onStopCrawler}
                                            loading={stopLoading}
                                        >
                                            停止爬虫
                                        </Button>
                                    )}
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<PlayCircleOutlined />}
                                        loading={startLoading}
                                        disabled={isRunning}
                                    >
                                        {isRunning ? '爬虫运行中...' : '启动爬虫'}
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </TabPane>
                
                <TabPane 
                    tab={<span><DashboardOutlined /> 爬虫状态</span>} 
                    key="status"
                >
                    <StyledCard 
                        title={<><InfoCircleOutlined /> 实时爬虫状态</>} 
                        className="status-card"
                        extra={
                            <Button 
                                icon={<ReloadOutlined />} 
                                size="small" 
                                onClick={fetchStatus}
                            >
                                刷新
                            </Button>
                        }
                    >
                        <Spin spinning={loading}>
                            <Row gutter={[16, 24]}>
                                <Col span={8}>
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
                                </Col>
                                <Col span={8}>
                                    <Statistic title="已爬取URL数" value={status.visited_urls || 0} />
                                </Col>
                                <Col span={8}>
                                    <Statistic title="已发现文章数" value={status.articles_found || 0} />
                                </Col>
                            </Row>
                            
                            {status.current_url && (
                                <Alert
                                    style={{ marginTop: 16 }}
                                    message="当前爬取进度"
                                    description={
                                        <div>
                                            <Text strong>正在爬取: </Text>
                                            <Text style={{ wordBreak: 'break-all' }}>{status.current_url}</Text>
                                        </div>
                                    }
                                    type="info"
                                    showIcon
                                />
                            )}
                            
                            {status.error && (
                                <Alert
                                    style={{ marginTop: 16 }}
                                    message="爬虫出错"
                                    description={status.error}
                                    type="error"
                                    showIcon
                                />
                            )}
                            
                            {isRunning && (
                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<PauseCircleOutlined />}
                                        onClick={onStopCrawler}
                                        loading={stopLoading}
                                    >
                                        停止爬虫
                                    </Button>
                                </div>
                            )}
                        </Spin>
                    </StyledCard>
                    
                    <StyledCard 
                        title="爬虫说明" 
                        style={{ marginTop: 16 }}
                    >
                        <Collapse>
                            <Panel header="爬虫功能说明" key="1">
                                <Paragraph>
                                    本爬虫系统支持多种高级爬取功能：
                                </Paragraph>
                                <ul>
                                    <li><Text strong>包含子站点</Text> - 爬取主域名下的所有子站点</li>
                                    <li><Text strong>跟随外部链接</Text> - 跟随并爬取指向外部网站的链接</li>
                                    <li><Text strong>处理Javascript</Text> - 使用浏览器引擎执行JS后爬取页面内容</li>
                                    <li><Text strong>爬取分页</Text> - 智能识别并依次爬取分页内容</li>
                                    <li><Text strong>处理登录</Text> - 支持通过表单登录后爬取需要身份验证的内容</li>
                                    <li><Text strong>批量URL导入</Text> - 支持通过Excel或CSV文件批量导入多个URL</li>
                                </ul>
                            </Panel>
                            <Panel header="LLM内容提取" key="2">
                                <Paragraph>
                                    启用LLM内容提取功能可以：
                                </Paragraph>
                                <ul>
                                    <li>精确识别文章正文，分离导航、广告等无关内容</li>
                                    <li>提取并结构化表格数据</li>
                                    <li>识别文章标题、摘要、关键信息</li>
                                    <li>内容分类和标签生成</li>
                                </ul>
                            </Panel>
                            <Panel header="数据清洗集成" key="3">
                                <Paragraph>
                                    在爬取过程中启用数据清洗可以：
                                </Paragraph>
                                <ul>
                                    <li>移除HTML标签和无关内容</li>
                                    <li>标准化文本格式和结构</li>
                                    <li>去除重复和低质量内容</li>
                                    <li>提高数据的整体质量和可用性</li>
                                </ul>
                            </Panel>
                        </Collapse>
                    </StyledCard>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default CrawlerControl;