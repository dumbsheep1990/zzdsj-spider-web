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
    Skeleton
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
    DatabaseOutlined
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
    const [useLLM, setUseLLM] = useState(false);
    const navigate = useNavigate();

    const onSubmitCrawl = async (values) => {
        try {
            setLoading(true);

            // 构建表单数据
            const formData = new FormData();
            formData.append('url', values.url);

            if (values.css_selector) {
                formData.append('css_selector', values.css_selector);
            }

            formData.append('use_llm', values.use_llm);

            if (values.use_llm && values.llm_instructions) {
                formData.append('llm_instructions', values.llm_instructions);
            }

            // 发送请求
            const res = await crawlerAPI.customCrawl(formData);

            // 导航到结果页面
            notification.success({
                message: '爬取任务已启动',
                description: '单页爬取任务已成功启动，正在处理中。',
            });

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

    return (
        <div className="custom-crawl">
            <Title level={4}>单页爬取</Title>
            <Paragraph>
                使用Crawl4AI爬取单个网页，支持CSS选择器定位和LLM智能提取。
            </Paragraph>

            <Card title="爬取配置" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="custom_crawl_form"
                    onFinish={onSubmitCrawl}
                    layout="vertical"
                    initialValues={{
                        url: '',
                        css_selector: '',
                        use_llm: false,
                        llm_instructions: '提取网页中的主要内容，包括标题、正文、表格和重要信息。去除广告和导航等无关内容。'
                    }}
                >
                    <Form.Item
                        name="url"
                        label="网页URL"
                        rules={[{ required: true, message: '请输入网页URL' }]}
                    >
                        <Input placeholder="请输入要爬取的网页URL" />
                    </Form.Item>

                    <Form.Item
                        name="css_selector"
                        label="CSS选择器 (可选)"
                        tooltip="用于定位页面中的特定元素，如 .article-content 或 #main-content"
                    >
                        <Input placeholder="可选，用于定位特定内容" />
                    </Form.Item>

                    <Form.Item
                        name="use_llm"
                        label="使用LLM智能提取"
                        valuePropName="checked"
                    >
                        <Switch onChange={(checked) => setUseLLM(checked)} />
                    </Form.Item>

                    {useLLM && (
                        <Form.Item
                            name="llm_instructions"
                            label="LLM提取指令"
                            tooltip="告诉LLM需要从页面中提取什么内容"
                        >
                            <TextArea
                                rows={4}
                                placeholder="例如：提取文章的标题、发布日期、作者和主要内容，忽略广告和导航"
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SearchOutlined />}
                        >
                            开始爬取
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="功能说明">
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="单页爬取的用途" key="1">
                        <Paragraph>
                            单页爬取功能允许你快速获取单个网页的内容，无需启动完整的爬虫任务。适用于以下场景：
                        </Paragraph>
                        <ul>
                            <li>测试网页提取效果</li>
                            <li>获取特定文章内容</li>
                            <li>验证CSS选择器</li>
                            <li>试用LLM智能提取功能</li>
                        </ul>
                    </Panel>
                    <Panel header="CSS选择器使用说明" key="2">
                        <Paragraph>
                            CSS选择器用于定位网页中的特定元素，常见选择器包括：
                        </Paragraph>
                        <ul>
                            <li><code>.class-name</code> - 选择特定class的元素</li>
                            <li><code>#id-name</code> - 选择特定id的元素</li>
                            <li><code>article</code> - 选择特定标签的元素</li>
                            <li><code>.content p</code> - 选择.content下的所有p元素</li>
                        </ul>
                        <Paragraph>
                            留空则提取整个页面内容。
                        </Paragraph>
                    </Panel>
                    <Panel header="LLM智能提取说明" key="3">
                        <Paragraph>
                            启用LLM智能提取后，系统将使用OpenAI API根据提供的指令智能分析和提取网页内容。
                            可以通过提取指令告诉LLM需要关注的内容和格式要求。
                        </Paragraph>
                    </Panel>
                </Collapse>
            </Card>
        </div>
    );
}

export default CustomCrawl;