import React, { useState } from 'react';
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
    Select
} from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
// 导入API（这里用模拟数据，实际项目中应创建真实API）

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;

function AIExtract() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [extractedContent, setExtractedContent] = useState(null);
    const [extractMode, setExtractMode] = useState('url');
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

    const onSubmitExtract = async (values) => {
        try {
            setLoading(true);

            // 构建表单数据
            const formData = new FormData();

            if (extractMode === 'url') {
                formData.append('url', values.url);
            } else {
                formData.append('html_content', values.html_content);
            }

            formData.append('instructions', values.instructions);
            formData.append('llm_config', values.llm_config);

            // 模拟调用LLM提取API
            // 实际项目中应替换为真实API调用
            setTimeout(() => {
                // 模拟的提取结果
                const mockResult = {
                    title: "关于进一步加强城市规划建设管理工作的通知",
                    publish_date: "2023-05-15",
                    department: "六盘水市住房和城乡建设局",
                    content: "为贯彻落实中央城市工作会议精神，进一步加强城市规划建设管理工作，改善城市人居环境，提升城市品质和文化内涵，现就有关事项通知如下：\n\n一、强化城市规划工作\n1. 严格控制城市开发边界，划定生态保护红线、永久基本农田和城镇开发边界等空间管控边界。\n2. 优化城市空间布局，促进生产空间集约高效、生活空间宜居适度、生态空间山清水秀。\n\n二、提升城市建设水平\n1. 加强市政基础设施建设，完善城市道路、供水、排水、供电、供气、环卫等设施。\n2. 推进海绵城市建设，提高城市防洪排涝能力和雨水资源化利用水平。",
                    key_points: [
                        "强化城市规划工作",
                        "严格控制城市开发边界",
                        "优化城市空间布局",
                        "加强市政基础设施建设",
                        "推进海绵城市建设"
                    ],
                    attachments: [
                        {
                            name: "城市规划建设管理工作指导手册.pdf",
                            url: "https://example.com/document.pdf"
                        }
                    ]
                };

                setExtractedContent(mockResult);
                setLoading(false);

                notification.success({
                    message: '提取成功',
                    description: '内容已成功提取并结构化。',
                });
            }, 2000);

        } catch (error) {
            console.error('AI提取失败:', error);
            notification.error({
                message: '提取失败',
                description: error.response?.data?.detail || 'AI内容提取失败，请重试。',
            });
            setLoading(false);
        }
    };

    return (
        <div className="ai-extract">
            <Title level={4}>AI内容提取</Title>
            <Paragraph>
                使用大型语言模型(LLM)智能提取和结构化网页内容。
            </Paragraph>

            <Card title="AI提取配置" style={{ marginBottom: 16 }}>
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

                    <Form.Item
                        name="model"
                        label="LLM 模型"
                        rules={[{ required: true, message: '请选择 LLM 模型' }]}
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

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<RobotOutlined />}
                        >
                            开始提取
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {extractedContent && (
                <Card title="提取结果" style={{ marginBottom: 16 }}>
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
                </Card>
            )}

            <Card title="AI提取功能说明">
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
        </div>
    );
}

export default AIExtract;