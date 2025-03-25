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
    Select,
    Row,
    Col,
    InputNumber,
    Divider,
    Tag,
    Radio,
    Tabs,
    Slider,
    Alert
} from 'antd';
import {
    DatabaseOutlined,
    QuestionCircleOutlined,
    ClearOutlined,
    RobotOutlined,
    ToolOutlined,
    SettingOutlined,
    BulbOutlined,
    FilterOutlined,
    TableOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    CheckOutlined,
    SaveOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { cleaningAPI } from '../../api';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Title, Paragraph, Text } = Typography;
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
    
    &.feature-card {
        border-left: 3px solid #1890ff;
    }
    
    &.advanced-card {
        border-left: 3px solid #722ed1;
    }
    
    &.llm-card {
        border-left: 3px solid #13c2c2;
    }
    
    &.execute-card {
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

function DataCleaning() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [runningCleaning, setRunningCleaning] = useState(false);
    const [useLLMCleaning, setUseLLMCleaning] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedFeatures, setSelectedFeatures] = useState({
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

    // 获取当前提供商
    const getCurrentProvider = () => {
        return form.getFieldValue('provider') || settings.llmSettings.activeProvider;
    };

    // 更新选择的功能
    const updateSelectedFeature = (feature, value) => {
        setSelectedFeatures(prev => ({
            ...prev,
            [feature]: value
        }));
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setConfigLoading(true);
            const res = await cleaningAPI.getConfig();
            
            // 设置表单值
            form.setFieldsValue({
                ...res.data,
                provider: settings.llmSettings.activeProvider,
                model: settings.llmSettings[settings.llmSettings.activeProvider]?.model,
                advancedSettings: {
                    minContentLength: res.data.advancedSettings?.minContentLength || 100,
                    maxTableRows: res.data.advancedSettings?.maxTableRows || 50,
                    contentQualityThreshold: res.data.advancedSettings?.contentQualityThreshold || 0.7,
                    duplicateThreshold: res.data.advancedSettings?.duplicateThreshold || 0.8,
                },
                llmSettings: {
                    temperature: res.data.llmSettings?.temperature || 0.5,
                    maxTokens: res.data.llmSettings?.maxTokens || 1000,
                    promptTemplate: res.data.llmSettings?.promptTemplate || '请清理和结构化以下文本内容，移除无关信息，保留重要内容，并按照合理的格式组织:'
                }
            });
            
            // 设置选中功能
            setSelectedFeatures({
                removeHtmlTags: res.data.remove_html_tags || true,
                extractTables: res.data.extract_tables || true,
                extractAttachments: res.data.extract_attachments || true,
                extractImages: res.data.extract_images || true,
                formatText: res.data.format_text || false,
                removeDuplicates: res.data.remove_duplicates || false,
                standardizeHeaders: res.data.standardize_headers || false,
                smartTruncate: res.data.smart_truncate || false
            });
            
            setUseLLMCleaning(res.data.use_llm_cleaning || false);
            setConfigLoading(false);
        } catch (error) {
            console.error('获取清洗配置失败:', error);
            setConfigLoading(false);
        }
    };

    const onSaveConfig = async (values) => {
        // 将选中功能添加到表单值中
        const formData = {
            ...values,
            remove_html_tags: selectedFeatures.removeHtmlTags,
            extract_tables: selectedFeatures.extractTables,
            extract_attachments: selectedFeatures.extractAttachments,
            extract_images: selectedFeatures.extractImages,
            format_text: selectedFeatures.formatText,
            remove_duplicates: selectedFeatures.removeDuplicates,
            standardize_headers: selectedFeatures.standardizeHeaders,
            smart_truncate: selectedFeatures.smartTruncate
        };
        
        try {
            setLoading(true);
            await cleaningAPI.saveConfig(formData);
            notification.success({
                message: '保存成功',
                description: '数据清洗配置已保存。',
                icon: <SaveOutlined style={{ color: '#52c41a' }} />
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
                icon: <ClearOutlined style={{ color: '#52c41a' }} />
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

    // 功能项渲染
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

    return (
        <div className="data-cleaning">
            <Title level={4}>
                <ClearOutlined /> 数据清洗
            </Title>
            <Paragraph>
                配置和执行数据清洗任务，支持基础清洗和LLM智能清洗，大幅提高内容质量。
            </Paragraph>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane 
                    tab={<span><SettingOutlined /> 清洗配置</span>} 
                    key="basic"
                >
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
                                provider: settings.llmSettings.activeProvider,
                                model: settings.llmSettings[settings.llmSettings.activeProvider]?.model,
                                advancedSettings: {
                                    minContentLength: 100,
                                    maxTableRows: 50,
                                    contentQualityThreshold: 0.7,
                                    duplicateThreshold: 0.8,
                                },
                                llmSettings: {
                                    temperature: 0.5,
                                    maxTokens: 1000,
                                    promptTemplate: '请清理和结构化以下文本内容，移除无关信息，保留重要内容，并按照合理的格式组织:'
                                }
                            }}
                        >
                            {/* 基础清洗功能 */}
                            <StyledCard 
                                title={<><FilterOutlined /> 基础清洗功能</>} 
                                className="feature-card"
                                extra={<Text type="secondary">选择要启用的清洗功能</Text>}
                            >
                                <Row gutter={[16, 16]}>
                                    {renderFeatureItem(<FileTextOutlined />, '移除HTML标签', '清理文本中的HTML标签，只保留纯文本内容', 'removeHtmlTags')}
                                    {renderFeatureItem(<TableOutlined />, '提取表格', '识别并提取文本中的表格，保留结构化数据', 'extractTables')}
                                    {renderFeatureItem(<FileTextOutlined />, '提取附件', '提取并保存文档中的附件', 'extractAttachments')}
                                    {renderFeatureItem(<FileTextOutlined />, '提取图片', '提取文章中的图片资源', 'extractImages')}
                                </Row>
                            </StyledCard>

                            {/* 高级清洗功能 */}
                            <StyledCard 
                                title={<><ToolOutlined /> 高级清洗功能</>} 
                                className="advanced-card"
                                extra={<Text type="secondary">更精细的清洗选项</Text>}
                            >
                                <Row gutter={[16, 16]}>
                                    {renderFeatureItem(<FileTextOutlined />, '格式化文本', '标准化段落格式，保证一致性', 'formatText')}
                                    {renderFeatureItem(<FilterOutlined />, '去除重复内容', '识别并移除重复的段落和内容', 'removeDuplicates')}
                                    {renderFeatureItem(<FileTextOutlined />, '标准化标题', '统一文档标题格式，规范层级关系', 'standardizeHeaders')}
                                    {renderFeatureItem(<BulbOutlined />, '智能截断', '根据内容关联性智能截断超长文本', 'smartTruncate')}
                                </Row>
                            
                                <Divider orientation="left">高级设置参数</Divider>
                                
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['advancedSettings', 'minContentLength']}
                                            label="最小内容长度"
                                            tooltip="少于此长度的内容将被视为无效"
                                        >
                                            <InputNumber min={10} max={1000} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['advancedSettings', 'maxTableRows']}
                                            label="表格最大行数"
                                            tooltip="超过此行数的表格将被截断"
                                        >
                                            <InputNumber min={10} max={500} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['advancedSettings', 'contentQualityThreshold']}
                                            label="内容质量阈值"
                                            tooltip="低于此阈值的内容会被标记为低质量"
                                        >
                                            <Slider min={0} max={1} step={0.05} marks={{ 0: '低', 0.5: '中', 1: '高' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['advancedSettings', 'duplicateThreshold']}
                                            label="重复内容阈值"
                                            tooltip="相似度超过此值的内容将被视为重复"
                                        >
                                            <Slider min={0} max={1} step={0.05} marks={{ 0: '低', 0.5: '中', 1: '高' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </StyledCard>
                            
                            {/* LLM智能清洗 */}
                            <StyledCard 
                                title={<><RobotOutlined /> LLM智能清洗</>} 
                                className="llm-card"
                                extra={
                                    <Switch
                                        checked={useLLMCleaning}
                                        onChange={(checked) => setUseLLMCleaning(checked)}
                                    />
                                }
                            >
                                {!useLLMCleaning ? (
                                    <Alert
                                        message="LLM智能清洗未启用"
                                        description="启用LLM智能清洗可以更精确地结构化文章内容，通过大语言模型进行内容提取、整理和格式化"
                                        type="info"
                                        showIcon
                                        action={
                                            <Button size="small" type="primary" onClick={() => setUseLLMCleaning(true)}>
                                                启用
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <>
                                        <Form.Item
                                            name="use_llm_cleaning"
                                            hidden
                                            initialValue={true}
                                            valuePropName="checked"
                                        >
                                            <Switch checked={true} />
                                        </Form.Item>
                                        
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

                                        {getCurrentProvider() !== 'custom' && (
                                            <Form.Item
                                                name="model"
                                                label="LLM 模型"
                                                rules={[{ required: useLLMCleaning, message: '请选择 LLM 模型' }]}
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
                                                    name={['llmSettings', 'temperature']}
                                                    label="温度参数"
                                                    tooltip="控制生成文本的随机性，值越低结果越确定"
                                                >
                                                    <Slider min={0} max={1} step={0.1} marks={{ 0: '精确', 0.5: '平衡', 1: '创意' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={['llmSettings', 'maxTokens']}
                                                    label="最大输出长度"
                                                    tooltip="限制LLM一次处理的最大长度"
                                                >
                                                    <InputNumber min={100} max={8000} step={100} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Item
                                            name={['llmSettings', 'promptTemplate']}
                                            label="提示词模板"
                                            tooltip="自定义给LLM的指令，用于指导模型如何清洗内容"
                                        >
                                            <Input.TextArea rows={4} placeholder="输入清洗提示词模板..." />
                                        </Form.Item>
                                    </>
                                )}
                            </StyledCard>

                            <Row justify="space-between" style={{ marginTop: 24 }}>
                                <Col>
                                    <Button
                                        type="default"
                                        onClick={fetchConfig}
                                        icon={<SettingOutlined />}
                                    >
                                        重置配置
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                    >
                                        保存配置
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Spin>
                </TabPane>
                
                <TabPane 
                    tab={<span><DatabaseOutlined /> 执行清洗</span>} 
                    key="execute"
                >
                    <StyledCard className="execute-card">
                        <Row gutter={[16, 24]}>
                            <Col span={24}>
                                <Alert
                                    message="执行数据清洗"
                                    description="数据清洗将根据配置对已爬取的文章进行处理。如果启用了LLM智能清洗，系统将使用大模型对文章内容进行智能结构化和清洗。"
                                    type="info"
                                    showIcon
                                />
                            </Col>
                            
                            <Col span={24}>
                                <Paragraph type="warning">
                                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                                    注意：数据清洗任务会在后台运行，可能需要一些时间，取决于文章数量。
                                </Paragraph>
                            </Col>
                            
                            <Col span={24}>
                                <Row justify="center">
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={onRunCleaning}
                                        loading={runningCleaning}
                                        icon={<ClearOutlined />}
                                    >
                                        开始数据清洗
                                    </Button>
                                </Row>
                            </Col>
                        </Row>
                    </StyledCard>
                    
                    <StyledCard 
                        title="LLM智能清洗说明" 
                        style={{ marginTop: 16 }}
                    >
                        <Collapse>
                            <Panel header="LLM智能清洗功能" key="1">
                                <Paragraph>
                                    启用LLM智能清洗后，系统将使用大语言模型对文章内容进行全面分析和结构化，包括：
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
                    </StyledCard>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default DataCleaning;