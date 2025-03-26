import React, { useState, useEffect } from 'react';
import {
    Spin,
    Card,
    Statistic,
    Typography,
    List,
    Tag,
    Space,
    Row,
    Col,
    Progress,
    Divider,
    Alert,
    Tabs,
    Badge,
    Button,
    Timeline,
    Empty,
    DatePicker,
    Tooltip
} from 'antd';
import {
    DashboardOutlined,
    FundOutlined,
    PieChartOutlined,
    BarChartOutlined,
    LineChartOutlined,
    LinkOutlined,
    FileTextOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    GlobalOutlined,
    ClockCircleOutlined,
    DatabaseOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    ReloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    FileImageOutlined,
    AlertOutlined
} from '@ant-design/icons';
import { crawlerAPI } from '../api';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 为仪表盘添加一些模拟数据
const mockChartData = {
    dailyCrawls: [
        { date: '2023-01-01', count: 120 },
        { date: '2023-01-02', count: 132 },
        { date: '2023-01-03', count: 101 },
        { date: '2023-01-04', count: 134 },
        { date: '2023-01-05', count: 90 },
        { date: '2023-01-06', count: 230 },
        { date: '2023-01-07', count: 210 }
    ],
    contentTypes: {
        'html': 65,
        'pdf': 15,
        'doc': 8,
        'xls': 5,
        'image': 7
    },
    responseStatus: {
        '200': 85,
        '301': 6,
        '302': 4,
        '404': 3,
        '500': 2
    },
    performanceData: {
        avgResponseTime: 0.8,
        avgCrawlSpeed: 3.2,
        avgProcessingTime: 1.2,
        avgMemoryUsage: 42.5
    }
};

function Dashboard() {
    const [status, setStatus] = useState({});
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [subdomains, setSubdomains] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState([moment().subtract(7, 'days'), moment()]);
    const [recentLogs, setRecentLogs] = useState([
        { time: new Date(Date.now() - 5000), message: '成功爬取页面: https://example.com/page1', type: 'success' },
        { time: new Date(Date.now() - 10000), message: '提取到5条结构化数据', type: 'info' },
        { time: new Date(Date.now() - 15000), message: '重定向: https://old.example.com -> https://new.example.com', type: 'warning' },
        { time: new Date(Date.now() - 20000), message: '无法访问页面: https://example.com/error', type: 'error' },
    ]);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        cpuUsage: 42,
        memoryUsage: 38,
        diskUsage: 65,
        networkUsage: 22,
        crawlSpeed: 3.2,
        responseTime: 0.8,
        errorRate: 2.1
    });
    const [contentStats, setContentStats] = useState({
        articles: { total: 1245, today: 78, trend: 12 },
        images: { total: 521, today: 35, trend: -5 },
        documents: { total: 310, today: 22, trend: 8 },
        videos: { total: 98, today: 5, trend: 2 }
    });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // 每5秒刷新一次
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 获取爬虫状态
            const statusRes = await crawlerAPI.getStatus();
            setStatus(statusRes.data);

            // 获取爬取统计
            const statsRes = await crawlerAPI.getStats();
            if (!statsRes.data.message) {
                setStats(statsRes.data);
            }

            // 获取子域名列表
            const subdomainsRes = await crawlerAPI.getSubdomains();
            setSubdomains(subdomainsRes.data);

            // 在实际应用中，这里应该从API获取更多数据
            // 目前使用模拟数据
            setPerformanceMetrics({
                cpuUsage: Math.floor(30 + Math.random() * 30),
                memoryUsage: Math.floor(30 + Math.random() * 40),
                diskUsage: Math.floor(50 + Math.random() * 20),
                networkUsage: Math.floor(10 + Math.random() * 30),
                crawlSpeed: (2 + Math.random() * 3).toFixed(1),
                responseTime: (0.5 + Math.random() * 1).toFixed(1),
                errorRate: (1 + Math.random() * 3).toFixed(1)
            });

            // 模拟内容统计数据
            const articleIncrease = Math.floor(Math.random() * 20) - 5;
            const imageIncrease = Math.floor(Math.random() * 15) - 7;
            const docIncrease = Math.floor(Math.random() * 10) - 2;
            const videoIncrease = Math.floor(Math.random() * 5) - 1;

            setContentStats(prev => ({
                articles: { 
                    total: prev.articles.total + articleIncrease, 
                    today: Math.max(0, Math.floor(Math.random() * 100)), 
                    trend: articleIncrease > 0 ? articleIncrease : articleIncrease 
                },
                images: { 
                    total: prev.images.total + imageIncrease, 
                    today: Math.max(0, Math.floor(Math.random() * 50)), 
                    trend: imageIncrease > 0 ? imageIncrease : imageIncrease
                },
                documents: { 
                    total: prev.documents.total + docIncrease, 
                    today: Math.max(0, Math.floor(Math.random() * 30)), 
                    trend: docIncrease > 0 ? docIncrease : docIncrease
                },
                videos: { 
                    total: prev.videos.total + videoIncrease, 
                    today: Math.max(0, Math.floor(Math.random() * 10)), 
                    trend: videoIncrease > 0 ? videoIncrease : videoIncrease
                }
            }));
            
            // 为日志添加一个新条目
            const logTypes = ['success', 'info', 'warning', 'error'];
            const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
            const logMessages = [
                '成功爬取页面: https://example.com/page' + Math.floor(Math.random() * 100),
                '提取到' + Math.floor(Math.random() * 10) + '条结构化数据',
                '重定向: https://old.example.com -> https://new.example.com/' + Math.floor(Math.random() * 10),
                '无法访问页面: https://example.com/error' + Math.floor(Math.random() * 10)
            ];
            const newLog = {
                time: new Date(),
                message: logMessages[Math.floor(Math.random() * logMessages.length)],
                type: logType
            };
            
            setRecentLogs(prev => [newLog, ...prev.slice(0, 9)]);  // 保持最多10条日志

            setLoading(false);
        } catch (error) {
            console.error('获取数据失败:', error);
            setLoading(false);
        }
    };

    // 计算爬虫运行时间
    const getRunningTime = () => {
        if (!status.start_time) return '未开始';

        const start = new Date(status.start_time);
        const end = status.end_time ? new Date(status.end_time) : new Date();
        const seconds = Math.floor((end - start) / 1000);

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours}小时 ${minutes}分钟 ${remainingSeconds}秒`;
    };

    return (
        <Spin spinning={loading}>
            <div className="dashboard">
                <Title level={4}>系统概览</Title>
                <Paragraph>
                    本系统基于Crawl4AI智能爬虫框架开发，提供政府网站的智能数据爬取、清洗和管理功能。
                    支持使用LLM（大型语言模型）进行智能数据提取和内容结构化。
                </Paragraph>

                <Card title="爬虫状态" style={{ marginBottom: 16 }}>
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
                        <Statistic title="访问URL数" value={status.visited_urls || 0} />
                        <Statistic title="发现文章数" value={status.articles_found || 0} />
                        <Statistic title="子站点数" value={status.subdomains_found || 0} />
                    </div>
                    {status.status === 'running' && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>当前正在爬取: </Text>
                            <Text>{status.current_url || '未知'}</Text>
                        </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                        <Text strong>运行时间: </Text>
                        <Text>{getRunningTime()}</Text>
                    </div>
                </Card>

                {stats && stats.visited_urls && (
                    <Card title="爬取统计" style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Statistic title="爬取URL总数" value={stats.visited_urls || 0} />
                            <Statistic title="文章总数" value={stats.articles_found || 0} />
                            <Statistic title="总耗时(秒)" value={stats.duration_seconds || 0} />
                        </div>
                    </Card>
                )}

                <Card title="子站点列表" style={{ marginBottom: 16 }}>
                    <List
                        size="small"
                        bordered
                        dataSource={subdomains}
                        renderItem={item => (
                            <List.Item>
                                <Text>{item.url}</Text>
                                <div>
                                    <Tag color={item.crawled ? 'green' : 'orange'}>
                                        {item.crawled ? '已爬取' : '未爬取'}
                                    </Tag>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </Spin>
    );
}

export default Dashboard;