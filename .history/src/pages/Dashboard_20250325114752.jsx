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
    AlertOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { crawlerAPI } from '../api';
import moment from 'moment';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 添加仪表盘样式
const DashboardContainer = styled.div`
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .status-card-row {
    margin-bottom: 20px;
  }

  .status-card {
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  }

  .status-detail {
    margin-top: 8px;
  }

  .dashboard-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  }

  .content-stat-card {
    height: 100%;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  .chart-container {
    padding: 10px;
  }

  .chart-bar-item {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
  }

  .chart-label {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .chart-value {
    margin-top: 4px;
    font-weight: bold;
  }

  .log-item {
    display: flex;
    flex-direction: column;
  }

  .log-time {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 4px;
  }

  .log-message {
    word-break: break-all;
  }

  .ant-timeline-item {
    padding-bottom: 16px;
  }

  .dashboard-tabs {
    margin-top: 8px;
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`;

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

    // 格式化数据大小
    const formatDataSize = (size) => {
        if (!size) return '0 KB';
        if (size < 1024) return `${size} KB`;
        return `${(size / 1024).toFixed(2)} MB`;
    };
    
    // 获取趋势图标和颜色
    const getTrendIcon = (trend) => {
        if (trend > 0) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
        if (trend < 0) return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
        return null;
    };
    
    // 渲染日志图标
    const renderLogIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'info': return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
            case 'warning': return <AlertOutlined style={{ color: '#faad14' }} />;
            case 'error': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
            default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        }
    };
    
    // 获取状态徽章颜色
    const getStatusBadgeStatus = (status) => {
        switch(status) {
            case 'running': return 'processing';
            case 'completed': return 'success';
            case 'stopped': return 'default';
            case 'error': return 'error';
            default: return 'default';
        }
    };
    
    // 日期范围变更处理
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        // 在实际应用中，这里应该根据日期范围获取新数据
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <Title level={4}><DashboardOutlined /> 系统仪表盘</Title>
                    <Paragraph>
                        智能爬虫系统数据分析与监控中心，提供实时状态、性能监控和数据统计。
                    </Paragraph>
                </div>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchData}
                    loading={loading}
                >
                    刷新数据
                </Button>
            </div>
            
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                {/* 状态概览卡片组 */}
                <Row gutter={[16, 16]} className="status-card-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="status-card">
                            <Statistic
                                title={
                                    <span>
                                        爬虫状态
                                        <Badge 
                                            status={getStatusBadgeStatus(status.status)} 
                                            style={{ marginLeft: 8 }}
                                        />
                                    </span>
                                }
                                value={
                                    status.status === 'running' ? '运行中' :
                                    status.status === 'completed' ? '已完成' :
                                    status.status === 'stopped' ? '已停止' :
                                    status.status === 'error' ? '出错' : '未开始'
                                }
                                valueStyle={{ 
                                    color: status.status === 'running' ? '#1890ff' :
                                           status.status === 'completed' ? '#52c41a' :
                                           status.status === 'error' ? '#f5222d' : '#000000' 
                                }}
                                prefix={<DashboardOutlined />}
                            />
                            <div className="status-detail">
                                <Text type="secondary">运行时间: {getRunningTime()}</Text>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="status-card">
                            <Statistic
                                title="已爬取URL"
                                value={status.visited_urls || 0}
                                prefix={<LinkOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                            <div className="status-detail">
                                <Progress 
                                    percent={Math.min(100, Math.round((status.visited_urls || 0) / (status.max_urls || 100) * 100))} 
                                    size="small" 
                                    status="active" 
                                    showInfo={false} 
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="status-card">
                            <Statistic
                                title="发现文章数"
                                value={status.articles_found || 0}
                                prefix={<FileTextOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                            <div className="status-detail">
                                <Text type="secondary">
                                    约占URL的{Math.round((status.articles_found || 0) / (status.visited_urls || 1) * 100)}%
                                </Text>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="status-card">
                            <Statistic
                                title="子站点数"
                                value={status.subdomains_found || 0}
                                prefix={<GlobalOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                            <div className="status-detail">
                                <Text type="secondary">
                                    已爬取: {subdomains.filter(s => s.crawled).length} 个
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
                
                {/* 主要内容区域 */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} className="dashboard-tabs">
                    {/* 概览选项卡 */}
                    <TabPane 
                        tab={<span><FundOutlined /> 数据概览</span>} 
                        key="overview"
                    >
                        {/* 性能指标 */}
                        <Card 
                            title={<span><BarChartOutlined /> 系统性能监控</span>} 
                            className="dashboard-card"
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={6}>
                                    <Statistic
                                        title="CPU使用率"
                                        value={performanceMetrics.cpuUsage}
                                        suffix="%"
                                        precision={0}
                                    />
                                    <Progress 
                                        percent={performanceMetrics.cpuUsage} 
                                        size="small"
                                        status={performanceMetrics.cpuUsage > 80 ? "exception" : "normal"}
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Statistic
                                        title="内存使用率"
                                        value={performanceMetrics.memoryUsage}
                                        suffix="%"
                                        precision={0}
                                    />
                                    <Progress 
                                        percent={performanceMetrics.memoryUsage} 
                                        size="small"
                                        status={performanceMetrics.memoryUsage > 80 ? "exception" : "normal"}
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Statistic
                                        title="爬取速度"
                                        value={performanceMetrics.crawlSpeed}
                                        suffix="页/秒"
                                        precision={1}
                                    />
                                    <Progress 
                                        percent={performanceMetrics.crawlSpeed * 10} 
                                        size="small"
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Statistic
                                        title="错误率"
                                        value={performanceMetrics.errorRate}
                                        suffix="%"
                                        precision={1}
                                        valueStyle={{ color: performanceMetrics.errorRate > 5 ? '#f5222d' : 'inherit' }}
                                    />
                                    <Progress 
                                        percent={performanceMetrics.errorRate * 10} 
                                        size="small"
                                        status={performanceMetrics.errorRate > 5 ? "exception" : "normal"}
                                    />
                                </Col>
                            </Row>
                        </Card>
                        
                        {/* 内容统计 */}
                        <Card 
                            title={<span><DatabaseOutlined /> 内容统计</span>} 
                            className="dashboard-card"
                            style={{ marginTop: 16 }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="content-stat-card">
                                        <Statistic
                                            title={<span><FileTextOutlined /> 文章</span>}
                                            value={contentStats.articles.total}
                                            precision={0}
                                            valueStyle={{ color: '#1890ff' }}
                                            suffix={
                                                <Tooltip title={`今日: +${contentStats.articles.today}`}>
                                                    {getTrendIcon(contentStats.articles.trend)}
                                                    <span style={{ fontSize: '14px', marginLeft: '5px' }}>
                                                        {Math.abs(contentStats.articles.trend)}
                                                    </span>
                                                </Tooltip>
                                            }
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="content-stat-card">
                                        <Statistic
                                            title={<span><FileImageOutlined /> 图片</span>}
                                            value={contentStats.images.total}
                                            precision={0}
                                            valueStyle={{ color: '#13c2c2' }}
                                            suffix={
                                                <Tooltip title={`今日: +${contentStats.images.today}`}>
                                                    {getTrendIcon(contentStats.images.trend)}
                                                    <span style={{ fontSize: '14px', marginLeft: '5px' }}>
                                                        {Math.abs(contentStats.images.trend)}
                                                    </span>
                                                </Tooltip>
                                            }
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="content-stat-card">
                                        <Statistic
                                            title={<span><FilePdfOutlined /> 文档</span>}
                                            value={contentStats.documents.total}
                                            precision={0}
                                            valueStyle={{ color: '#fa8c16' }}
                                            suffix={
                                                <Tooltip title={`今日: +${contentStats.documents.today}`}>
                                                    {getTrendIcon(contentStats.documents.trend)}
                                                    <span style={{ fontSize: '14px', marginLeft: '5px' }}>
                                                        {Math.abs(contentStats.documents.trend)}
                                                    </span>
                                                </Tooltip>
                                            }
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="content-stat-card">
                                        <Statistic
                                            title={<span><FileExcelOutlined /> 表格</span>}
                                            value={contentStats.videos.total}
                                            precision={0}
                                            valueStyle={{ color: '#52c41a' }}
                                            suffix={
                                                <Tooltip title={`今日: +${contentStats.videos.today}`}>
                                                    {getTrendIcon(contentStats.videos.trend)}
                                                    <span style={{ fontSize: '14px', marginLeft: '5px' }}>
                                                        {Math.abs(contentStats.videos.trend)}
                                                    </span>
                                                </Tooltip>
                                            }
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </TabPane>
                    
                    {/* 活动日志 */}
                    <TabPane 
                        tab={<span><ClockCircleOutlined /> 近期活动</span>} 
                        key="activity"
                    >
                        {/* 活动日志 */}
                        <Card 
                            title={<span><ClockCircleOutlined /> 近期活动</span>} 
                            className="dashboard-card"
                            style={{ marginTop: 16 }}
                        >
                            <Timeline>
                                {recentLogs.map((log, index) => (
                                    <Timeline.Item 
                                        key={index} 
                                        dot={renderLogIcon(log.type)}
                                        color={
                                            log.type === 'success' ? 'green' :
                                            log.type === 'info' ? 'blue' :
                                            log.type === 'warning' ? 'orange' :
                                            log.type === 'error' ? 'red' : 'blue'
                                        }
                                    >
                                        <div className="log-item">
                                            <span className="log-time">
                                                {log.time.toLocaleTimeString()}
                                            </span>
                                            <span className="log-message">
                                                {log.message}
                                            </span>
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Card>
                        
                        {/* 当前爬取状态 */}
                        {status.status === 'running' && status.current_url && (
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
                    </TabPane>
                    
                    {/* 站点分析选项卡 */}
                    <TabPane 
                        tab={<span><PieChartOutlined /> 站点分析</span>} 
                        key="sites"
                    >
                        <Card 
                            title={<span><GlobalOutlined /> 子站点统计</span>} 
                            className="dashboard-card"
                            extra={
                                <Text type="secondary">
                                    共发现 {subdomains.length} 个子站点
                                </Text>
                            }
                        >
                            {subdomains.length > 0 ? (
                                <List
                                    size="small"
                                    dataSource={subdomains}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Badge 
                                                    status={item.crawled ? 'success' : 'processing'} 
                                                    text={item.crawled ? '已爬取' : '未爬取'}
                                                />,
                                                <Text type="secondary">
                                                    {item.pages || 0} 页
                                                </Text>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<GlobalOutlined />}
                                                title={item.url}
                                                description={item.description || '无描述'}
                                            />
                                        </List.Item>
                                    )}
                                    pagination={{
                                        pageSize: 10,
                                        size: 'small'
                                    }}
                                />
                            ) : (
                                <Empty description="暂无子站点数据" />
                            )}
                        </Card>
                        
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Card 
                                    title={<span><PieChartOutlined /> 内容类型分布</span>} 
                                    className="dashboard-card"
                                >
                                    <div className="chart-container">
                                        {/* 在实际项目中，这里可以使用 ECharts 或 Chart.js 等库渲染图表 */}
                                        <div className="mock-chart" style={{ height: 300 }}>
                                            {Object.entries(mockChartData.contentTypes).map(([type, count], index) => (
                                                <div key={index} className="chart-bar-item">
                                                    <div className="chart-label">
                                                        {type === 'html' && <GlobalOutlined />}
                                                        {type === 'pdf' && <FilePdfOutlined />}
                                                        {type === 'doc' && <FileTextOutlined />}
                                                        {type === 'xls' && <FileExcelOutlined />}
                                                        {type === 'image' && <FileImageOutlined />}
                                                        <span style={{ marginLeft: 8 }}>{type.toUpperCase()}</span>
                                                    </div>
                                                    <Progress
                                                        percent={count}
                                                        showInfo={false}
                                                        status="normal"
                                                        strokeColor={{
                                                            '0%': '#108ee9',
                                                            '100%': '#87d068',
                                                        }}
                                                    />
                                                    <span className="chart-value">{count}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card 
                                    title={<span><PieChartOutlined /> 响应状态分布</span>} 
                                    className="dashboard-card"
                                >
                                    <div className="chart-container">
                                        <div className="mock-chart" style={{ height: 300 }}>
                                            {Object.entries(mockChartData.responseStatus).map(([code, count], index) => (
                                                <div key={index} className="chart-bar-item">
                                                    <div className="chart-label">
                                                        <Tag color={
                                                            code.startsWith('2') ? 'green' :
                                                            code.startsWith('3') ? 'blue' :
                                                            code.startsWith('4') ? 'orange' :
                                                            'red'
                                                        }>
                                                            {code}
                                                        </Tag>
                                                        <span style={{ marginLeft: 8 }}>
                                                            {code === '200' ? 'OK' :
                                                             code === '301' ? '永久重定向' :
                                                             code === '302' ? '临时重定向' :
                                                             code === '404' ? '未找到' :
                                                             code === '500' ? '服务器错误' : '未知'}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        percent={count}
                                                        showInfo={false}
                                                        status={code.startsWith('2') ? 'success' :
                                                                code.startsWith('4') || code.startsWith('5') ? 'exception' :
                                                                'normal'}
                                                    />
                                                    <span className="chart-value">{count}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>
                    
                    {/* 趋势分析选项卡 */}
                    <TabPane 
                        tab={<span><LineChartOutlined /> 趋势分析</span>} 
                        key="trends"
                    >
                        <Card 
                            title={<span><LineChartOutlined /> 数据爬取趋势</span>} 
                            className="dashboard-card"
                            extra={
                                <RangePicker 
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    allowClear={false}
                                />
                            }
                        >
                            <div className="chart-container">
                                <div className="mock-chart" style={{ height: 300 }}>
                                    {/* 在实际项目中，这里可以使用 ECharts 或 Chart.js 等库渲染趋势图表 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                                        <div style={{ display: 'flex', height: '60%', alignItems: 'flex-end' }}>
                                            {mockChartData.dailyCrawls.map((item, index) => (
                                                <div key={index} style={{ 
                                                    flex: 1, 
                                                    height: `${(item.count / 250) * 100}%`, 
                                                    backgroundColor: '#1890ff',
                                                    margin: '0 4px',
                                                    borderTopLeftRadius: '3px',
                                                    borderTopRightRadius: '3px',
                                                    position: 'relative'
                                                }}>
                                                    <Tooltip title={`${item.date}: ${item.count}页`}>
                                                        <div style={{ 
                                                            position: 'absolute', 
                                                            top: '-20px', 
                                                            left: '50%', 
                                                            transform: 'translateX(-50%)',
                                                            fontSize: '12px'
                                                        }}>
                                                            {item.count}
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', marginTop: '8px' }}>
                                            {mockChartData.dailyCrawls.map((item, index) => (
                                                <div key={index} style={{ 
                                                    flex: 1, 
                                                    textAlign: 'center', 
                                                    fontSize: '12px', 
                                                    color: '#999' 
                                                }}>
                                                    {item.date.split('-')[2]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <Card 
                            title={<span><BarChartOutlined /> 性能指标趋势</span>} 
                            className="dashboard-card"
                            style={{ marginTop: 16 }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Card title="平均响应时间" bordered={false}>
                                        <Statistic
                                            value={mockChartData.performanceData.avgResponseTime}
                                            suffix="秒"
                                            precision={1}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                        <Progress
                                            percent={(mockChartData.performanceData.avgResponseTime / 2) * 100}
                                            status="active"
                                            strokeColor={{
                                                '0%': '#1890ff',
                                                '100%': '#87d068',
                                            }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="平均爬取速度" bordered={false}>
                                        <Statistic
                                            value={mockChartData.performanceData.avgCrawlSpeed}
                                            suffix="页/秒"
                                            precision={1}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                        <Progress
                                            percent={(mockChartData.performanceData.avgCrawlSpeed / 5) * 100}
                                            status="active"
                                            strokeColor={{
                                                '0%': '#52c41a',
                                                '100%': '#87d068',
                                            }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </TabPane>
                </Tabs>
            </Spin>
        </div>
    );
}

export default Dashboard;