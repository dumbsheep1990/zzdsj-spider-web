import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Button,
    Input,
    Switch,
    Card,
    Typography,
    notification,
    Collapse,
    Row,
    Col,
    Tabs,
    Space,
    Select,
    Radio,
    Divider,
    Tag,
    Tooltip,
    Upload,
    Alert,
    Popover,
    Skeleton,
    Empty
} from 'antd';
import { 
    SearchOutlined, 
    UploadOutlined,
    LinkOutlined,
    HistoryOutlined,
    CodeOutlined,
    RobotOutlined,
    SettingOutlined,
    BulbOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    BookOutlined,
    GlobalOutlined,
    PaperClipOutlined,
    FullscreenOutlined,
    QuestionCircleOutlined,
    DownloadOutlined,
    ProfileOutlined,
    DatabaseOutlined,
    EyeOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { crawlerAPI } from '../../api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;

// 样式组件
const CustomCrawlContainer = styled.div`
  .page-header {
    margin-bottom: 24px;
  }
  
  .custom-card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    border-radius: 8px;
    margin-bottom: 24px;
  }
  
  .settings-section {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  .url-input {
    .ant-input-prefix {
      color: #1890ff;
    }
  }
  
  .selector-example {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
    padding: 8px 12px;
    margin-top: 8px;
    font-family: monospace;
  }
  
  .history-item {
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border-color: #d9d9d9;
    }
  }
  
  .option-card {
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    }
    
    .option-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
  }
  
  .extraction-method {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    margin-bottom: 16px;
    transition: all 0.3s;
    cursor: pointer;
    
    &:hover {
      border-color: #40a9ff;
    }
    
    &.selected {
      border-color: #1890ff;
      background-color: #e6f7ff;
    }
    
    .method-icon {
      font-size: 28px;
      margin-bottom: 12px;
    }
    
    .method-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .method-desc {
      color: rgba(0, 0, 0, 0.45);
      text-align: center;
    }
  }
`;

function CustomCrawl() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('crawl');
    const [extractMethod, setExtractMethod] = useState('auto');
    const [useLLM, setUseLLM] = useState(true);
    const [advancedVisible, setAdvancedVisible] = useState(false);
    const [historyItems, setHistoryItems] = useState([
        { 
            id: '123', 
            url: 'https://example.com/article/12345', 
            method: 'llm', 
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            title: '示例文章标题',
            status: 'completed'
        },
        { 
            id: '124', 
            url: 'https://example.org/news/tech-update', 
            method: 'css', 
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            title: '技术更新新闻',
            status: 'completed'
        },
        { 
            id: '125', 
            url: 'https://blog.example.net/post/ai-trends', 
            method: 'auto', 
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            title: 'AI发展趋势分析',
            status: 'completed'
        }
    ]);
    const navigate = useNavigate();

    // 提交爬取任务
    const onSubmitCrawl = async (values) => {
        try {
            setLoading(true);

            // 构建表单数据
            const formData = new FormData();
            formData.append('url', values.url);
            formData.append('extract_method', extractMethod);

            if (extractMethod === 'css' && values.css_selector) {
                formData.append('css_selector', values.css_selector);
            } else if (extractMethod === 'xpath' && values.xpath) {
                formData.append('xpath', values.xpath);
            }

            formData.append('use_llm', values.use_llm);

            if (values.use_llm && values.llm_instructions) {
                formData.append('llm_instructions', values.llm_instructions);
            }

            // 高级选项
            if (advancedVisible) {
                if (values.wait_time) formData.append('wait_time', values.wait_time);
                if (values.timeout) formData.append('timeout', values.timeout);
                if (values.user_agent) formData.append('user_agent', values.user_agent);
                if (values.render_js) formData.append('render_js', values.render_js);
                if (values.extract_images) formData.append('extract_images', values.extract_images);
                if (values.extract_links) formData.append('extract_links', values.extract_links);
            }

            // 发送请求
            const res = await crawlerAPI.customCrawl(formData);

            // 导航到结果页面
            notification.success({
                message: '爬取任务已启动',
                description: '单页爬取任务已成功启动，正在处理中。',
            });

            // 添加到历史记录
            const newHistoryItem = {
                id: res.data.crawl_id,
                url: values.url,
                method: extractMethod,
                timestamp: new Date().toISOString(),
                status: 'processing'
            };
            
            setHistoryItems([newHistoryItem, ...historyItems]);

            navigate(`/custom-crawl/${res.data.crawl_id}`);
            setLoading(false);
        } catch (error) {
            console.error('单页爬取失败:', error);
            notification.error({
                message: '爬取失败',
                description: error.response?.data?.detail || '单页爬取任务失败，请重试。',
            });
            setLoading(false);
        }
    };
    
    // 从历史记录中查看结果
    const viewHistoryItem = (id) => {
        navigate(`/custom-crawl/${id}`);
    };
    
    // 预设提取指令
    const extractionTemplates = [
        { key: 'article', name: '文章内容', prompt: '提取页面中的文章内容，包括标题、作者、发布日期和正文。忽略导航、广告和其他无关内容。' },
        { key: 'news', name: '新闻稿', prompt: '提取新闻稿内容，包括新闻标题、发布时间、来源、摘要和正文内容。' },
        { key: 'product', name: '产品信息', prompt: '提取产品详情，包括产品名称、价格、描述、规格参数和图片URL。' },
        { key: 'profile', name: '人物介绍', prompt: '提取人物介绍信息，包括姓名、职位、组织、简介和联系方式。' },
        { key: 'research', name: '研究报告', prompt: '提取研究报告内容，包括标题、作者、摘要、关键发现、方法论和结论。' }
    ];
    
    // 应用提取模板
    const applyTemplate = (templateKey) => {
        const template = extractionTemplates.find(t => t.key === templateKey);
        if (template) {
            form.setFieldsValue({
                llm_instructions: template.prompt
            });
        }
    };

    // 内容提取Tab
    const renderCrawlTab = () => (
        <>
            <Card className="custom-card">
                <Form
                    form={form}
                    name="custom_crawl_form"
                    onFinish={onSubmitCrawl}
                    layout="vertical"
                    initialValues={{
                        url: '',
                        css_selector: '',
                        xpath: '',
                        use_llm: true,
                        llm_instructions: '提取网页中的主要内容，包括标题、正文、表格和重要信息。去除广告和导航等无关内容。',
                        wait_time: 2,
                        timeout: 30,
                        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        render_js: true,
                        extract_images: true,
                        extract_links: false
                    }}
                >
                    <Form.Item
                        name="url"
                        label={
                            <span>
                                网页URL 
                                <Tooltip title="输入要提取内容的网页完整URL地址">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: '请输入网页URL' }]}
                    >
                        <Input 
                            prefix={<GlobalOutlined className="site-form-item-icon" />}
                            placeholder="请输入要提取内容的网页URL"
                            className="url-input"
                            size="large"
                        />
                    </Form.Item>

                    <Divider orientation="left">提取方式</Divider>
                    
                    <Row gutter={16}>
                        <Col span={8}>
                            <div 
                                className={`extraction-method ${extractMethod === 'auto' ? 'selected' : ''}`}
                                onClick={() => setExtractMethod('auto')}
                            >
                                <RobotOutlined className="method-icon" />
                                <div className="method-title">智能提取</div>
                                <div className="method-desc">自动分析网页结构，智能识别主要内容</div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div 
                                className={`extraction-method ${extractMethod === 'css' ? 'selected' : ''}`}
                                onClick={() => setExtractMethod('css')}
                            >
                                <CodeOutlined className="method-icon" />
                                <div className="method-title">CSS选择器</div>
                                <div className="method-desc">使用CSS选择器精确定位页面元素</div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div 
                                className={`extraction-method ${extractMethod === 'xpath' ? 'selected' : ''}`}
                                onClick={() => setExtractMethod('xpath')}
                            >
                                <ProfileOutlined className="method-icon" />
                                <div className="method-title">XPath</div>
                                <div className="method-desc">使用XPath表达式提取结构化内容</div>
                            </div>
                        </Col>
                    </Row>

                    {extractMethod === 'css' && (
                        <Form.Item
                            name="css_selector"
                            label={
                                <span>
                                    CSS选择器
                                    <Tooltip title="使用CSS选择器定位页面元素，如 .article-content 或 #main-content">
                                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[{ required: true, message: '使用CSS选择器模式时，请输入CSS选择器' }]}
                        >
                            <Input 
                                placeholder="例如: .article-content, #main-content"
                                prefix={<CodeOutlined />}
                            />
                        </Form.Item>
                    )}

                    {extractMethod === 'xpath' && (
                        <Form.Item
                            name="xpath"
                            label={
                                <span>
                                    XPath表达式
                                    <Tooltip title="使用XPath表达式定位页面元素，如 //div[@class='article']/p">
                                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[{ required: true, message: '使用XPath模式时，请输入XPath表达式' }]}
                        >
                            <Input 
                                placeholder="例如: //div[@class='article']/p, //article"
                                prefix={<ProfileOutlined />}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="use_llm"
                        label={
                            <span>
                                LLM智能分析
                                <Tooltip title="使用大语言模型分析和优化提取结果，提高内容质量">
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
                                name="llm_instructions"
                                label={
                                    <span>
                                        提取指令
                                        <Tooltip title="告诉AI模型需要提取什么内容以及如何处理">
                                            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                        </Tooltip>
                                    </span>
                                }
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="例如：提取文章的标题、发布日期、作者和主要内容，忽略广告和导航"
                                />
                            </Form.Item>
                            
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary">提取模板：</Text>
                                <Space style={{ marginLeft: 8 }}>
                                    {extractionTemplates.map(template => (
                                        <Tag 
                                            key={template.key} 
                                            color="blue" 
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => applyTemplate(template.key)}
                                        >
                                            {template.name}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        </>
                    )}
                    
                    <Divider>
                        <a onClick={() => setAdvancedVisible(!advancedVisible)}>
                            <SettingOutlined /> {advancedVisible ? '隐藏高级选项' : '显示高级选项'}
                        </a>
                    </Divider>
                    
                    {advancedVisible && (
                        <div className="settings-section">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        name="wait_time"
                                        label="等待时间(秒)"
                                        tooltip="等待页面加载的时间，对于动态加载的页面可能需要更长时间"
                                    >
                                        <Select>
                                            <Option value={0}>0 - 无等待</Option>
                                            <Option value={1}>1 秒</Option>
                                            <Option value={2}>2 秒</Option>
                                            <Option value={5}>5 秒</Option>
                                            <Option value={10}>10 秒</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="timeout"
                                        label="超时时间(秒)"
                                        tooltip="请求超时时间，超过此时间将终止请求"
                                    >
                                        <Select>
                                            <Option value={10}>10 秒</Option>
                                            <Option value={30}>30 秒</Option>
                                            <Option value={60}>60 秒</Option>
                                            <Option value={120}>120 秒</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        name="user_agent"
                                        label="User Agent"
                                        tooltip="指定访问时使用的用户代理标识"
                                    >
                                        <Input placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..." />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="render_js"
                                        label="渲染JavaScript"
                                        tooltip="是否等待页面JavaScript执行完成后提取内容"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="extract_images"
                                        label="提取图片"
                                        tooltip="是否从页面中提取图片URL"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="extract_links"
                                        label="提取链接"
                                        tooltip="是否从页面中提取超链接"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SearchOutlined />}
                            size="large"
                            block
                        >
                            开始提取
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            
            <Card title={<span><InfoCircleOutlined /> 功能说明</span>} className="custom-card">
                <Collapse defaultActiveKey={['1']} ghost>
                    <Panel header="单页提取的用途" key="1">
                        <Paragraph>
                            单页提取功能允许你快速获取单个网页的内容，无需启动完整的爬虫任务。适用于以下场景：
                        </Paragraph>
                        <Row gutter={16}>
                            <Col span={6}>
                                <div className="option-card">
                                    <div className="option-title">
                                        <FileTextOutlined /> 内容分析
                                    </div>
                                    <div>获取特定文章的结构化内容，用于分析或归档</div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="option-card">
                                    <div className="option-title">
                                        <CodeOutlined /> 选择器测试
                                    </div>
                                    <div>测试和验证CSS选择器或XPath表达式的有效性</div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="option-card">
                                    <div className="option-title">
                                        <RobotOutlined /> AI提取验证
                                    </div>
                                    <div>验证LLM智能提取功能在特定页面的表现效果</div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="option-card">
                                    <div className="option-title">
                                        <BookOutlined /> 知识库构建
                                    </div>
                                    <div>为向量数据库或知识库快速收集特定网页内容</div>
                                </div>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>
            </Card>
        </>
    );

    // 提取历史Tab
    const renderHistoryTab = () => (
        <Card className="custom-card">
            <Alert
                message="提取历史记录"
                description="您最近进行的单页提取任务记录，点击可查看提取结果。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            
            {historyItems.length > 0 ? (
                historyItems.map(item => (
                    <div key={item.id} className="history-item" onClick={() => viewHistoryItem(item.id)}>
                        <Row>
                            <Col span={16}>
                                <div style={{ marginBottom: 4 }}>
                                    <Text strong>{item.title || item.url}</Text>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary" ellipsis style={{ maxWidth: '100%' }}>
                                        {item.url}
                                    </Text>
                                </div>
                                <Space>
                                    <Tag color="blue">
                                        {item.method === 'auto' ? '智能提取' : 
                                        item.method === 'css' ? 'CSS选择器' : 
                                        item.method === 'xpath' ? 'XPath' : '未知方式'}
                                    </Tag>
                                    <Tag color={item.status === 'completed' ? 'green' : 'orange'}>
                                        {item.status === 'completed' ? '已完成' : '处理中'}
                                    </Tag>
                                    <Text type="secondary">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button 
                                        type="primary" 
                                        ghost 
                                        icon={<EyeOutlined />}
                                        onClick={() => viewHistoryItem(item.id)}
                                    >
                                        查看
                                    </Button>
                                    <Button 
                                        icon={<FullscreenOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(item.url, '_blank');
                                        }}
                                    >
                                        原网页
                                    </Button>
                                    <Button 
                                        icon={<DownloadOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 下载功能待实现
                                            notification.info({
                                                message: '下载功能',
                                                description: '提取内容下载功能即将上线'
                                            });
                                        }}
                                    >
                                        下载
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>
                ))
            ) : (
                <Empty description="暂无提取历史" />
            )}
        </Card>
    );
    
    // 提取技巧Tab
    const renderTipsTab = () => (
        <Card className="custom-card">
            <Tabs defaultActiveKey="1">
                <TabPane tab="CSS选择器技巧" key="1">
                    <Title level={5}>常用CSS选择器</Title>
                    <Paragraph>
                        CSS选择器用于精确定位网页中的元素，以下是常用的CSS选择器示例：
                    </Paragraph>
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Card size="small" title=".class 选择器">
                                <div className="selector-example">.article-content</div>
                                <div>选择所有class="article-content"的元素</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="#id 选择器">
                                <div className="selector-example">#main-content</div>
                                <div>选择id="main-content"的元素</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="元素选择器">
                                <div className="selector-example">article</div>
                                <div>选择所有article标签元素</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="后代选择器">
                                <div className="selector-example">.content p</div>
                                <div>选择class="content"元素内的所有p元素</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="子元素选择器">
                                <div className="selector-example">.content > p</div>
                                <div>选择直接子元素为p的.content元素</div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="属性选择器">
                                <div className="selector-example">a[href*="example"]</div>
                                <div>选择href属性包含"example"的所有a元素</div>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Divider />
                    
                    <Title level={5}>如何找到正确的CSS选择器</Title>
                    <Paragraph>
                        要找到合适的CSS选择器，您可以使用浏览器的开发者工具：
                    </Paragraph>
                    <ol>
                        <li>在目标网页右键点击目标元素，选择"检查"</li>
                        <li>在开发者工具中右键点击对应的HTML元素</li>
                        <li>选择"Copy" → "Copy selector"即可获取CSS选择器</li>
                    </ol>
                </TabPane>
                
                <TabPane tab="XPath技巧" key="2">
                    <Title level={5}>常用XPath表达式</Title>
                    <Paragraph>
                        XPath是一种强大的表达式语言，用于在XML/HTML文档中导航和选择节点：
                    </Paragraph>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card size="small" title="基本路径表达式">
                                <div className="selector-example">//article</div>
                                <div>选择所有article元素</div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="属性选择">
                                <div className="selector-example">//div[@class='content']</div>
                                <div>选择class="content"的所有div元素</div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="包含特定文本">
                                <div className="selector-example">//h1[contains(text(), '标题')]</div>
                                <div>选择文本包含"标题"的所有h1元素</div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="子节点选择">
                                <div className="selector-example">//div[@id='main']/p</div>
                                <div>选择id="main"的div的所有p子元素</div>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
                
                <TabPane tab="LLM提取指令技巧" key="3">
                    <Title level={5}>有效的LLM提取指令</Title>
                    <Paragraph>
                        编写清晰明确的提取指令可以帮助大语言模型更准确地提取您需要的内容：
                    </Paragraph>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card size="small" title="指定要提取的内容类型">
                                <div className="selector-example">提取此页面的新闻文章内容，包括标题、作者、发布日期和正文内容。</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card size="small" title="指定要排除的内容">
                                <div className="selector-example">提取主要文章内容，忽略页面上的广告、导航菜单、相关文章推荐和评论区。</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card size="small" title="指定格式化要求">
                                <div className="selector-example">提取产品信息并格式化为JSON，包含以下字段：名称、价格、描述、规格参数和图片URL。</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card size="small" title="指定上下文要求">
                                <div className="selector-example">提取这篇科技新闻文章，并识别所提到的公司名称、技术术语及其定义或解释。</div>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </Card>
    );

    return (
        <CustomCrawlContainer className="custom-crawl">
            <div className="page-header">
                <Title level={4}><LinkOutlined /> 单页提取</Title>
                <Paragraph>
                    提取单个网页的内容，支持多种提取方式和智能内容分析。轻松获取文章、产品、新闻等各类内容。
                </Paragraph>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
                <TabPane tab={<span><SearchOutlined /> 内容提取</span>} key="crawl">
                    {renderCrawlTab()}
                </TabPane>
                <TabPane tab={<span><HistoryOutlined /> 提取历史</span>} key="history">
                    {renderHistoryTab()}
                </TabPane>
                <TabPane tab={<span><BulbOutlined /> 提取技巧</span>} key="tips">
                    {renderTipsTab()}
                </TabPane>
            </Tabs>
        </CustomCrawlContainer>
    );
}

export default CustomCrawl;