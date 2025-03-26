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

// 格式化数据大小
const formatSize = size => {
    if (!size) return '0 KB';
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(2)} MB`;
};

// 添加StatsCardSection组件来显示统计数据
const StatsCardSection = ({ statsData }) => {
    if (!statsData || !statsData.visited_urls) return null;
    
    return (
        <Card title="爬取数据统计" className="dashboard-card" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Statistic 
                        title="累计爬取URL" 
                        value={statsData.visited_urls || 0} 
                        prefix={<LinkOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic 
                        title="累计文章数" 
                        value={statsData.articles_found || 0}
                        prefix={<FileTextOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic 
                        title="数据大小" 
                        value={formatSize(statsData.data_size || 0)}
                        prefix={<DatabaseOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic 
                        title="总耗时" 
                        value={`${statsData.duration_seconds || 0} 秒`}
                        prefix={<ClockCircleOutlined />}
                    />
                </Col>
            </Row>
        </Card>
    );
};

function Dashboard() {
    const [status, setStatus] = useState({});
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [sectionLoading, setSectionLoading] = useState({
        overview: false,
        activity: false,
        sites: false,
        trends: false
    });
    const [dataInitialized, setDataInitialized] = useState(false);
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
    
    // 更新mockChartData以确保图表数据显示完整
    const [chartData, setChartData] = useState({
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
        dailyCrawls: mockChartData.dailyCrawls,
        performanceData: mockChartData.performanceData
    });

    // 初始加载数据
    useEffect(() => {
        // 首次加载，不显示loading状态，静默加载
        fetchAllData(false);
        
        // 设置定时刷新活跃tab的数据
        const interval = setInterval(() => {
            // 根据当前活跃tab更新数据
            refreshActiveTabData();
        }, 5000); // 每5秒刷新一次
        
        return () => clearInterval(interval);
    }, [activeTab]); // 当活跃tab变化时重新设置定时器
    
    // 刷新当前活跃tab的数据
    const refreshActiveTabData = () => {
        switch(activeTab) {
            case 'overview':
                fetchStatusAndPerformance();
                break;
            case 'activity':
                fetchLogs();
                break;
            case 'sites':
                fetchSubdomains();
                break;
            case 'trends':
                fetchTrends();
                break;
            default:
                fetchStatusAndPerformance();
        }
    };
    
    // 一次性获取所有数据
    const fetchAllData = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        
        try {
            await Promise.all([
                fetchStatusAndPerformance(false),
                fetchSubdomains(false),
                fetchLogs(false),
                fetchTrends(false)
            ]);
            
            if (!dataInitialized) {
                setDataInitialized(true);
            }
        } catch (error) {
            console.error('获取数据失败:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // 获取状态和性能数据
    const fetchStatusAndPerformance = async (showSectionLoading = true) => {
        try {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, overview: true }));
            }
            
            // 获取爬虫状态
            const statusRes = await crawlerAPI.getStatus();
            setStatus(statusRes.data);

            // 获取爬取统计
            const statsRes = await crawlerAPI.getStats();
            if (!statsRes.data.message) {
                setStatsData(statsRes.data);
            }
            
            // 更新性能指标
            setPerformanceMetrics({
                cpuUsage: Math.floor(30 + Math.random() * 30),
                memoryUsage: Math.floor(30 + Math.random() * 40),
                diskUsage: Math.floor(50 + Math.random() * 20),
                networkUsage: Math.floor(10 + Math.random() * 30),
                crawlSpeed: (2 + Math.random() * 3).toFixed(1),
                responseTime: (0.5 + Math.random() * 1).toFixed(1),
                errorRate: (1 + Math.random() * 3).toFixed(1)
            });

            // 更新内容统计
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
        } catch (error) {
            console.error('获取状态和性能数据失败:', error);
        } finally {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, overview: false }));
            }
        }
    };
    
    // 获取子域名数据
    const fetchSubdomains = async (showSectionLoading = true) => {
        try {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, sites: true }));
            }
            
            const subdomainsRes = await crawlerAPI.getSubdomains();
            setSubdomains(subdomainsRes.data);

            // 更新内容类型分布和响应状态码分布
            setChartData(prev => ({
                ...prev,
                contentTypes: {
                    'html': Math.floor(55 + Math.random() * 20),
                    'pdf': Math.floor(10 + Math.random() * 10),
                    'doc': Math.floor(5 + Math.random() * 7),
                    'xls': Math.floor(3 + Math.random() * 5),
                    'image': Math.floor(5 + Math.random() * 5)
                },
                responseStatus: {
                    '200': Math.floor(80 + Math.random() * 15),
                    '301': Math.floor(3 + Math.random() * 5),
                    '302': Math.floor(2 + Math.random() * 4),
                    '404': Math.floor(1 + Math.random() * 4),
                    '500': Math.floor(1 + Math.random() * 2)
                }
            }));
        } catch (error) {
            console.error('获取子域名数据失败:', error);
        } finally {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, sites: false }));
            }
        }
    };
    
    // 获取日志数据
    const fetchLogs = async (showSectionLoading = true) => {
        try {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, activity: true }));
            }
            
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
            
            setRecentLogs(prev => [newLog, ...prev.slice(0, 19)]);  // 保持最多20条日志
        } catch (error) {
            console.error('获取日志数据失败:', error);
        } finally {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, activity: false }));
            }
        }
    };
    
    // 获取趋势数据
    const fetchTrends = async (showSectionLoading = true) => {
        try {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, trends: true }));
            }
            
            // 生成过去7天的爬取数据
            const today = moment();
            const dailyCrawls = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = moment(today).subtract(i, 'days').format('YYYY-MM-DD');
                const count = Math.floor(70 + Math.random() * 180);
                dailyCrawls.push({ date, count });
            }
            
            // 更新性能趋势数据
            setChartData(prev => ({
                ...prev,
                dailyCrawls,
                performanceData: {
                    avgResponseTime: (0.5 + Math.random() * 1).toFixed(1),
                    avgCrawlSpeed: (2 + Math.random() * 4).toFixed(1),
                    avgProcessingTime: (0.8 + Math.random() * 1.5).toFixed(1),
                    avgMemoryUsage: (35 + Math.random() * 25).toFixed(1)
                }
            }));
        } catch (error) {
            console.error('获取趋势数据失败:', error);
        } finally {
            if (showSectionLoading) {
                setSectionLoading(prev => ({ ...prev, trends: false }));
            }
        }
    };

    // 处理Tab切换
    const handleTabChange = (key) => {
        setActiveTab(key);
        
        // 切换Tab时刷新当前Tab的数据
        setTimeout(() => {
            switch(key) {
                case 'overview':
                    fetchStatusAndPerformance();
                    break;
                case 'activity':
                    fetchLogs();
                    break;
                case 'sites':
                    fetchSubdomains();
                    break;
                case 'trends':
                    fetchTrends();
                    break;
                default:
                    break;
            }
        }, 100);
    };

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

    const getTrendIcon = (trend) => {
        if (trend > 0) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
        if (trend < 0) return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
        return null;
    };
    
    const renderLogIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'info': return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
            case 'warning': return <AlertOutlined style={{ color: '#faad14' }} />;
            case 'error': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
            default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        }
    };
    
    const getStatusBadgeStatus = (status) => {
        switch(status) {
            case 'running': return 'processing';
            case 'completed': return 'success';
            case 'stopped': return 'default';
            case 'error': return 'error';
            default: return 'default';
        }
    };
    
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    return (
        <DashboardContainer>
            <div className="dashboard-header">
                <div>
                    <Title level={4}><DashboardOutlined /> 系统仪表盘</Title>
                <Paragraph>
                        智能爬虫系统数据分析与监控中心，提供实时状态、性能监控和数据统计。
                </Paragraph>
                </div>
                <Space>
                    {dataInitialized && 
                        <Badge 
                            status={getStatusBadgeStatus(status.status)} 
                            text={
                                status.status === 'running' ? '运行中' :
                                status.status === 'completed' ? '已完成' :
                                status.status === 'stopped' ? '已停止' :
                                status.status === 'error' ? '出错' : '未开始'
                            }
                        />
                    }
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => fetchAllData(true)}
                        loading={loading}
                    >
                        刷新数据
                    </Button>
                </Space>
            </div>
            
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
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
                
                {/* 显示统计数据卡片 */}
                {statsData && statsData.visited_urls && (
                    <StatsCardSection statsData={statsData} />
                )}
                
                <Tabs activeKey={activeTab} onChange={handleTabChange} className="dashboard-tabs">
                    <TabPane 
                        tab={<span><FundOutlined /> 数据概览</span>} 
                        key="overview"
                    >
                        <Spin spinning={sectionLoading.overview} indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}>
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
                        </Spin>
                    </TabPane>
                    
                    <TabPane 
                        tab={<span><ClockCircleOutlined /> 近期活动</span>} 
                        key="activity"
                    >
                        <Spin spinning={sectionLoading.activity} indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}>
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
                        </Spin>
                    </TabPane>
                    
                    <TabPane 
                        tab={<span><PieChartOutlined /> 站点分析</span>} 
                        key="sites"
                    >
                        <Spin spinning={sectionLoading.sites} indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}>
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
                                        bodyStyle={{ height: 380, overflowY: 'auto' }}
                                    >
                                        <div className="chart-container" style={{ padding: '10px 0' }}>
                                            {Object.entries(chartData.contentTypes).map(([type, count], index) => (
                                                <div key={index} className="chart-bar-item" style={{ marginBottom: 24 }}>
                                                    <div className="chart-label" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                                        {type === 'html' && <GlobalOutlined />}
                                                        {type === 'pdf' && <FilePdfOutlined />}
                                                        {type === 'doc' && <FileTextOutlined />}
                                                        {type === 'xls' && <FileExcelOutlined />}
                                                        {type === 'image' && <FileImageOutlined />}
                                                        <span style={{ marginLeft: 8 }}>{type.toUpperCase()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <Progress
                                                                percent={count}
                                                                showInfo={false}
                                                                status="normal"
                                                                strokeColor={{
                                                                    '0%': '#108ee9',
                                                                    '100%': '#87d068',
                                                                }}
                                                                strokeWidth={12}
                                                            />
                                                        </div>
                                                        <span className="chart-value" style={{ marginLeft: 10, fontSize: 16, fontWeight: 'bold', minWidth: 42, textAlign: 'right' }}>
                                                            {count}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card 
                                        title={<span><PieChartOutlined /> 响应状态分布</span>} 
                                        className="dashboard-card"
                                        bodyStyle={{ height: 380, overflowY: 'auto' }}
                                    >
                                        <div className="chart-container" style={{ padding: '10px 0' }}>
                                            {Object.entries(chartData.responseStatus).map(([code, count], index) => (
                                                <div key={index} className="chart-bar-item" style={{ marginBottom: 24 }}>
                                                    <div className="chart-label" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
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
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <Progress
                                                                percent={count}
                                                                showInfo={false}
                                                                status={code.startsWith('2') ? 'success' :
                                                                        code.startsWith('4') || code.startsWith('5') ? 'exception' :
                                                                        'normal'}
                                                                strokeWidth={12}
                                                            />
                                                        </div>
                                                        <span className="chart-value" style={{ marginLeft: 10, fontSize: 16, fontWeight: 'bold', minWidth: 42, textAlign: 'right' }}>
                                                            {count}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Spin>
                    </TabPane>
                    
                    <TabPane 
                        tab={<span><LineChartOutlined /> 趋势分析</span>} 
                        key="trends"
                    >
                        <Spin spinning={sectionLoading.trends} indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                                            <div style={{ display: 'flex', height: '60%', alignItems: 'flex-end' }}>
                                                {chartData.dailyCrawls.map((item, index) => (
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
                                                {chartData.dailyCrawls.map((item, index) => (
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
                                                value={chartData.performanceData.avgResponseTime}
                                                suffix="秒"
                                                precision={1}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                            <Progress
                                                percent={(chartData.performanceData.avgResponseTime / 2) * 100}
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
                                                value={chartData.performanceData.avgCrawlSpeed}
                                                suffix="页/秒"
                                                precision={1}
                                                valueStyle={{ color: '#52c41a' }}
                                            />
                                            <Progress
                                                percent={(chartData.performanceData.avgCrawlSpeed / 5) * 100}
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
                        </Spin>
                    </TabPane>
                </Tabs>
        </Spin>
        </DashboardContainer>
    );
}

export default Dashboard;