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