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