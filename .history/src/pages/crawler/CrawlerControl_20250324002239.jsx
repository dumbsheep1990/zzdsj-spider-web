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
    Collapse
} from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { crawlerAPI } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

function CrawlerControl() {
    const [form] = Form.useForm();
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [startLoading, setStartLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);
    const [useLLM, setUseLLM] = useState(false);

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
                        use_llm: false
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
                        name="use_llm"
                        label={
                            <span>
                使用LLM提取
                <Tooltip title="启用LLM智能提取可以更精确地识别和提取文章内容，但需要OpenAI API密钥">
                  <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              </span>
                        }
                        valuePropName="checked"
                    >
                        <Switch onChange={(checked) => setUseLLM(checked)} />
                    </Form.Item>

                    {useLLM && (
                        <Form.Item
                            name="llm_api_key"
                            label="OpenAI API密钥"
                            tooltip="如果已在系统环境变量中设置，可以留空"
                        >
                            <Input.Password placeholder="输入OpenAI API密钥" />
                        </Form.Item>
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
        </div>
    );
}

export default CrawlerControl;