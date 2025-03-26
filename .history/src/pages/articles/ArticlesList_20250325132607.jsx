import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Card,
    Button,
    Space,
    Input,
    Select,
    DatePicker,
    Typography,
    Tag,
    Row,
    Col,
    Divider,
    Dropdown,
    Menu,
    Tooltip,
    Badge,
    Modal,
    message,
    List,
    Avatar,
    Tabs,
    Statistic,
    Checkbox,
    Empty
} from 'antd';
import { 
    SearchOutlined, 
    ReloadOutlined, 
    FileTextOutlined,
    FolderOutlined,
    CalendarOutlined,
    BarChartOutlined,
    DownloadOutlined,
    EllipsisOutlined,
    EditOutlined,
    DeleteOutlined,
    StarOutlined,
    StarFilled,
    CheckCircleOutlined,
    EyeOutlined,
    FilterOutlined,
    PushpinOutlined,
    TagsOutlined,
    SortAscendingOutlined,
    ImportOutlined,
    ExportOutlined
} from '@ant-design/icons';
// mock API 数据，实际项目中替换为真实API调用
// import { articleAPI } from '../../api';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 样式组件
const ArticlesContainer = styled.div`
  .article-header {
    margin-bottom: 24px;
  }
  
  .article-card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    border-radius: 8px;
    margin-bottom: 24px;
  }
  
  .filter-section {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  .article-list-item {
    transition: all 0.3s;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      border-color: #d9d9d9;
    }
  }
  
  .article-item-title {
    font-weight: 500;
    margin-bottom: 8px;
    color: #222;
    
    &:hover {
      color: #1890ff;
    }
  }
  
  .article-meta {
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 8px;
  }
  
  .article-stats {
    color: rgba(0, 0, 0, 0.45);
    display: flex;
    gap: 16px;
  }
  
  .icon-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .article-action-btn {
    color: rgba(0, 0, 0, 0.45);
    
    &:hover {
      color: #1890ff;
    }
  }
  
  .featured-article {
    background-color: #f6ffed;
    border-color: #b7eb8f;
  }
  
  .stat-card {
    text-align: center;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 8px;
  }
  
  .article-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

// 模拟文章数据
const mockArticles = [
    {
        _id: '1',
        title: '关于开展2023年度政府信息公开工作考核的通知',
        domain: 'www.gzlps.gov.cn',
        publish_date: '2023-12-15',
        is_llm_extracted: true,
        crawled_at: '2023-12-16T08:30:00Z',
        content_summary: '根据《中华人民共和国政府信息公开条例》相关规定，现就开展2023年度政府信息公开工作考核有关事项通知如下...',
        word_count: 1245,
        category: '通知公告',
        has_attachments: true,
        tags: ['政府信息', '公开工作', '考核'],
        is_featured: true,
        author: '市政府办公室',
        view_count: 328
    },
    {
        _id: '2',
        title: '2023年三季度经济运行情况分析报告',
        domain: 'zjj.gzlps.gov.cn',
        publish_date: '2023-10-20',
        is_llm_extracted: true,
        crawled_at: '2023-10-21T10:15:00Z',
        content_summary: '2023年三季度，全市经济延续回升向好态势，主要指标增速回升，发展质量稳步提高...',
        word_count: 3560,
        category: '工作报告',
        has_attachments: true,
        tags: ['经济运行', '三季度', '分析报告'],
        is_featured: false,
        author: '发展和改革委员会',
        view_count: 756
    },
    {
        _id: '3',
        title: '关于举办第五届创新创业大赛的公告',
        domain: 'jyj.gzlps.gov.cn',
        publish_date: '2023-11-05',
        is_llm_extracted: false,
        crawled_at: '2023-11-06T09:45:00Z',
        content_summary: '为深入实施创新驱动发展战略，激发创新创业活力，现决定举办第五届创新创业大赛...',
        word_count: 980,
        category: '公告',
        has_attachments: false,
        tags: ['创新创业', '大赛', '公告'],
        is_featured: false,
        author: '教育局',
        view_count: 412
    },
    {
        _id: '4',
        title: '2024年城市建设规划公示',
        domain: 'zjj.gzlps.gov.cn',
        publish_date: '2023-12-28',
        is_llm_extracted: true,
        crawled_at: '2023-12-29T14:20:00Z',
        content_summary: '根据《城乡规划法》相关规定，现将2024年城市建设规划向社会公示，公示时间为30天...',
        word_count: 4120,
        category: '规划公示',
        has_attachments: true,
        tags: ['城市规划', '公示', '建设'],
        is_featured: true,
        author: '住建局',
        view_count: 1203
    },
    {
        _id: '5',
        title: '关于加强冬季大气污染防治工作的通知',
        domain: 'www.gzlps.gov.cn',
        publish_date: '2023-11-15',
        is_llm_extracted: false,
        crawled_at: '2023-11-16T16:10:00Z',
        content_summary: '为切实做好冬季大气污染防治工作，改善环境空气质量，保障人民群众身体健康...',
        word_count: 1680,
        category: '通知',
        has_attachments: false,
        tags: ['大气污染', '防治', '冬季'],
        is_featured: false,
        author: '环保局',
        view_count: 298
    },
    {
        _id: '6',
        title: '2023年度政府工作报告',
        domain: 'www.gzlps.gov.cn',
        publish_date: '2023-01-15',
        is_llm_extracted: true,
        crawled_at: '2023-01-16T09:05:00Z',
        content_summary: '2022年，面对复杂严峻的国际环境和艰巨繁重的国内改革发展稳定任务...',
        word_count: 12800,
        category: '工作报告',
        has_attachments: true,
        tags: ['政府工作', '年度报告'],
        is_featured: true,
        author: '市政府',
        view_count: 3245
    }
];

function ArticlesList() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState({
        domain: null,
        start_date: null,
        end_date: null,
        keyword: null,
        category: null,
        tags: [],
        is_featured: null,
        has_attachments: null
    });
    const [viewMode, setViewMode] = useState('list'); // list or table
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [batchActionVisible, setBatchActionVisible] = useState(false);
    const [sortField, setSortField] = useState('crawled_at');
    const [sortOrder, setSortOrder] = useState('descend');
    const [statistics, setStatistics] = useState({
        total: 0,
        today: 0,
        withAttachments: 0,
        categories: {}
    });
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchArticles();
        fetchStatistics();
    }, [page, pageSize, sortField, sortOrder, activeTab]);

    // 使用模拟数据
    const fetchArticles = async () => {
        try {
            setLoading(true);
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 使用模拟数据
            const filteredArticles = mockArticles.filter(article => {
                // 根据当前活动标签过滤
                if (activeTab === 'featured' && !article.is_featured) return false;
                if (activeTab === 'withAttachments' && !article.has_attachments) return false;
                
                // 应用筛选条件
                if (filters.domain && article.domain !== filters.domain) return false;
                if (filters.keyword && !article.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
                if (filters.category && article.category !== filters.category) return false;
                if (filters.has_attachments !== null && article.has_attachments !== filters.has_attachments) return false;
                if (filters.is_featured !== null && article.is_featured !== filters.is_featured) return false;
                
                // 日期筛选
                if (filters.start_date && new Date(article.publish_date) < new Date(filters.start_date)) return false;
                if (filters.end_date && new Date(article.publish_date) > new Date(filters.end_date)) return false;
                
                // 标签筛选
                if (filters.tags.length > 0 && !filters.tags.some(tag => article.tags.includes(tag))) return false;
                
                return true;
            });
            
            // 排序
            const sortedArticles = [...filteredArticles].sort((a, b) => {
                if (sortOrder === 'ascend') {
                    return a[sortField] > b[sortField] ? 1 : -1;
                } else {
                    return a[sortField] < b[sortField] ? 1 : -1;
                }
            });
            
            setArticles(sortedArticles);
            setTotal(sortedArticles.length);
            setLoading(false);
        } catch (error) {
            console.error('获取文章列表失败:', error);
            setLoading(false);
        }
    };
    
    // 获取统计数据
    const fetchStatistics = () => {
        // 从模拟数据计算统计信息
        const stats = {
            total: mockArticles.length,
            today: mockArticles.filter(a => new Date(a.crawled_at).toDateString() === new Date().toDateString()).length,
            withAttachments: mockArticles.filter(a => a.has_attachments).length,
            categories: {}
        };
        
        // 按分类汇总
        mockArticles.forEach(article => {
            if (!stats.categories[article.category]) {
                stats.categories[article.category] = 0;
            }
            stats.categories[article.category]++;
        });
        
        setStatistics(stats);
    };

    const onFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setPage(1); // 重置分页
    };
    
    const handleBatchAction = (action) => {
        if (selectedArticles.length === 0) {
            message.warning('请先选择文章');
            return;
        }
        
        switch (action) {
            case 'export':
                message.success(`已导出${selectedArticles.length}篇文章`);
                break;
            case 'tag':
                // 打开添加标签对话框
                // 此处添加标签功能实现
                message.success('添加标签成功');
                break;
            case 'delete':
                Modal.confirm({
                    title: '确认删除',
                    content: `确定要删除选中的${selectedArticles.length}篇文章吗？`,
                    onOk: () => {
                        // 此处实现删除功能
                        message.success(`已删除${selectedArticles.length}篇文章`);
                        setSelectedArticles([]);
                    }
                });
                break;
            default:
                break;
        }
    };
    
    const toggleFeatured = (articleId, isFeatured) => {
        // 更新模拟数据
        const updatedArticles = articles.map(article => {
            if (article._id === articleId) {
                return { ...article, is_featured: !isFeatured };
            }
            return article;
        });
        
        setArticles(updatedArticles);
        message.success(`${isFeatured ? '取消' : '设为'}重点文章成功`);
    };
    
    // 表格列配置
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <a 
                        onClick={() => navigate(`/article/${record._id}`)}
                        style={{ fontWeight: 500 }}
                    >
                        {text || '无标题'}
                    </a>
                    {record.is_featured && (
                        <Tag color="success" style={{ marginLeft: 8 }}>重点</Tag>
                    )}
                    {record.has_attachments && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>附件</Tag>
                    )}
                </div>
            )
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
        },
        {
            title: '站点',
            dataIndex: 'domain',
            key: 'domain',
            width: 180,
        },
        {
            title: '发布日期',
            dataIndex: 'publish_date',
            key: 'publish_date',
            width: 120,
            render: (text) => text || '未知',
            sorter: true
        },
        {
            title: '字数',
            dataIndex: 'word_count',
            key: 'word_count',
            width: 100,
            render: (count) => `${count} 字`,
            sorter: true
        },
        {
            title: '提取方式',
            dataIndex: 'is_llm_extracted',
            key: 'is_llm_extracted',
            width: 120,
            render: (text) => (
                text ? <Tag color="purple">LLM智能提取</Tag> : <Tag>常规提取</Tag>
            ),
            filters: [
                { text: 'LLM智能提取', value: true },
                { text: '常规提取', value: false }
            ],
            onFilter: (value, record) => record.is_llm_extracted === value
        },
        {
            title: '爬取时间',
            dataIndex: 'crawled_at',
            key: 'crawled_at',
            width: 180,
            render: (text) => new Date(text).toLocaleString(),
            sorter: true
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/article/${record._id}`)}
                    >
                        查看
                    </Button>
                    <Tooltip title={record.is_featured ? '取消重点' : '设为重点'}>
                        <Button
                            type="text"
                            size="small"
                            icon={record.is_featured ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                            onClick={() => toggleFeatured(record._id, record.is_featured)}
                        />
                    </Tooltip>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="edit" icon={<EditOutlined />}>
                                    编辑文章
                                </Menu.Item>
                                <Menu.Item key="download" icon={<DownloadOutlined />}>
                                    下载文章
                                </Menu.Item>
                                <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                                    删除文章
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<EllipsisOutlined />}
                        />
                    </Dropdown>
                </Space>
            )
        }
    ];
    
    // 渲染列表视图
    const renderListView = () => (
        <List
            dataSource={articles}
            renderItem={article => (
                <List.Item
                    className={`article-list-item ${article.is_featured ? 'featured-article' : ''}`}
                    onClick={() => navigate(`/article/${article._id}`)}
                    actions={[
                        <Space>
                            <Tooltip title="查看详情">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    className="article-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/article/${article._id}`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title={article.is_featured ? '取消重点' : '设为重点'}>
                                <Button
                                    type="text"
                                    icon={article.is_featured ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                                    className="article-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFeatured(article._id, article.is_featured);
                                    }}
                                />
                            </Tooltip>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        <Menu.Item key="edit" icon={<EditOutlined />}>
                                            编辑文章
                                        </Menu.Item>
                                        <Menu.Item key="download" icon={<DownloadOutlined />}>
                                            下载文章
                                        </Menu.Item>
                                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                                            删除文章
                                        </Menu.Item>
                                    </Menu>
                                }
                                trigger={['click']}
                            >
                                <Button
                                    type="text"
                                    icon={<EllipsisOutlined />}
                                    className="article-action-btn"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </Space>
                    ]}
                >
                    <List.Item.Meta
                        avatar={
                            <Avatar 
                                icon={<FileTextOutlined />} 
                                style={{ 
                                    backgroundColor: article.is_featured ? '#52c41a' : '#1890ff',
                                    marginTop: 4 
                                }}
                            />
                        }
                        title={
                            <div>
                                <span className="article-item-title">
                                    {article.title}
                                </span>
                                {article.is_featured && (
                                    <Tag color="success" style={{ marginLeft: 8 }}>重点</Tag>
                                )}
                            </div>
                        }
                        description={
                            <div>
                                <div className="article-meta">
                                    <Space split={<Divider type="vertical" />}>
                                        <span className="icon-text">
                                            <FolderOutlined /> {article.category}
                                        </span>
                                        <span className="icon-text">
                                            <CalendarOutlined /> {article.publish_date}
                                        </span>
                                        <span>{article.domain}</span>
                                        <span>{article.author}</span>
                                    </Space>
                                </div>
                                <div className="article-content-preview">
                                    {article.content_summary}
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    {article.tags.map(tag => (
                                        <Tag key={tag} className="article-tag">{tag}</Tag>
                                    ))}
                                </div>
                                <div className="article-stats" style={{ marginTop: 12 }}>
                                    <span className="icon-text">
                                        <EyeOutlined /> {article.view_count} 次查看
                                    </span>
                                    <span className="icon-text">
                                        <FileTextOutlined /> {article.word_count} 字
                                    </span>
                                    {article.has_attachments && (
                                        <Tag color="blue">附件</Tag>
                                    )}
                                    {article.is_llm_extracted && (
                                        <Tag color="purple">LLM提取</Tag>
                                    )}
                                </div>
                            </div>
                        }
                    />
                </List.Item>
            )}
            pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                },
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 篇文章`
            }}
        />
    );
    
    // 渲染表格视图
    const renderTableView = () => (
        <Table
            columns={columns}
            dataSource={articles}
            rowKey="_id"
            loading={loading}
            rowSelection={{
                selectedRowKeys: selectedArticles,
                onChange: setSelectedArticles,
            }}
            pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                },
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 篇文章`
            }}
            onChange={(pagination, filters, sorter) => {
                if (sorter.field) {
                    setSortField(sorter.field);
                    setSortOrder(sorter.order);
                }
            }}
        />
    );
    
    // 渲染统计卡片
    const renderStatistics = () => (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
                <Card className="stat-card">
                    <Statistic 
                        title="文章总数" 
                        value={statistics.total} 
                        prefix={<FileTextOutlined />} 
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="stat-card">
                    <Statistic 
                        title="今日新增" 
                        value={statistics.today} 
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="stat-card">
                    <Statistic 
                        title="包含附件" 
                        value={statistics.withAttachments} 
                        prefix={<FolderOutlined />} 
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card className="stat-card">
                    <Statistic 
                        title="分类数量" 
                        value={Object.keys(statistics.categories).length} 
                        prefix={<TagsOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                </Card>
            </Col>
        </Row>
    );

    return (
        <ArticlesContainer className="articles-list">
            <div className="article-header">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4}>文章管理中心</Title>
                        <Paragraph>
                            查看、分析和管理已爬取的文章内容，支持高级筛选、批量操作和数据统计。
                        </Paragraph>
                    </Col>
                    <Col>
                        <Space>
                            <Tooltip title="刷新数据">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchArticles}
                                />
                            </Tooltip>
                            <Tooltip title="切换视图">
                                <Button
                                    icon={viewMode === 'list' ? <BarChartOutlined /> : <FileTextOutlined />}
                                    onClick={() => setViewMode(viewMode === 'list' ? 'table' : 'list')}
                                >
                                    {viewMode === 'list' ? '表格视图' : '列表视图'}
                                </Button>
                            </Tooltip>
                            <Dropdown
                                overlay={
                                    <Menu onClick={({key}) => handleBatchAction(key)}>
                                        <Menu.Item key="export" icon={<ExportOutlined />}>导出选中文章</Menu.Item>
                                        <Menu.Item key="tag" icon={<TagsOutlined />}>批量添加标签</Menu.Item>
                                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger>批量删除文章</Menu.Item>
                                    </Menu>
                                }
                                disabled={selectedArticles.length === 0}
                            >
                                <Button type="primary">
                                    批量操作 {selectedArticles.length > 0 && `(${selectedArticles.length})`}
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>
                </Row>
            </div>
            
            {renderStatistics()}
            
            <Card className="article-card">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="全部文章" key="all">
                        <div className="filter-section">
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Input.Search
                                        placeholder="搜索文章标题或内容"
                                        allowClear
                                        onSearch={(value) => onFilterChange({ keyword: value })}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Select
                                        placeholder="选择站点"
                                        allowClear
                                        style={{ width: '100%' }}
                                        onChange={(value) => onFilterChange({ domain: value })}
                                    >
                                        <Option value="www.gzlps.gov.cn">www.gzlps.gov.cn</Option>
                                        <Option value="jyj.gzlps.gov.cn">jyj.gzlps.gov.cn</Option>
                                        <Option value="zjj.gzlps.gov.cn">zjj.gzlps.gov.cn</Option>
                                    </Select>
                                </Col>
                                <Col span={8}>
                                    <Select
                                        placeholder="选择分类"
                                        allowClear
                                        style={{ width: '100%' }}
                                        onChange={(value) => onFilterChange({ category: value })}
                                    >
                                        <Option value="通知公告">通知公告</Option>
                                        <Option value="工作报告">工作报告</Option>
                                        <Option value="公告">公告</Option>
                                        <Option value="规划公示">规划公示</Option>
                                        <Option value="通知">通知</Option>
                                    </Select>
                                </Col>
                                <Col span={8}>
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        onChange={(dates) => {
                                            if (dates) {
                                                onFilterChange({
                                                    start_date: dates[0]?.format('YYYY-MM-DD'),
                                                    end_date: dates[1]?.format('YYYY-MM-DD')
                                                });
                                            } else {
                                                onFilterChange({ start_date: null, end_date: null });
                                            }
                                        }}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            onClick={fetchArticles}
                                        >
                                            搜索
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => {
                                                setFilters({
                                                    domain: null,
                                                    start_date: null,
                                                    end_date: null,
                                                    keyword: null,
                                                    category: null,
                                                    tags: [],
                                                    is_featured: null,
                                                    has_attachments: null
                                                });
                                                setPage(1);
                                                fetchArticles();
                                            }}
                                        >
                                            重置筛选
                                        </Button>
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                    <Menu.Item key="featured">
                                                        <Checkbox
                                                            checked={filters.is_featured === true}
                                                            onChange={(e) => onFilterChange({ is_featured: e.target.checked ? true : null })}
                                                        >
                                                            只显示重点文章
                                                        </Checkbox>
                                                    </Menu.Item>
                                                    <Menu.Item key="attachments">
                                                        <Checkbox
                                                            checked={filters.has_attachments === true}
                                                            onChange={(e) => onFilterChange({ has_attachments: e.target.checked ? true : null })}
                                                        >
                                                            包含附件
                                                        </Checkbox>
                                                    </Menu.Item>
                                                    <Menu.Item key="llm">
                                                        <Checkbox
                                                            checked={filters.is_llm_extracted === true}
                                                            onChange={(e) => onFilterChange({ is_llm_extracted: e.target.checked ? true : null })}
                                                        >
                                                            LLM智能提取
                                                        </Checkbox>
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item key="sort">
                                                        <div>
                                                            <Text style={{ marginRight: 8 }}>排序方式:</Text>
                                                            <Select
                                                                size="small"
                                                                value={sortField}
                                                                style={{ width: 120 }}
                                                                onChange={(value) => setSortField(value)}
                                                            >
                                                                <Option value="crawled_at">爬取时间</Option>
                                                                <Option value="publish_date">发布日期</Option>
                                                                <Option value="word_count">字数</Option>
                                                                <Option value="view_count">浏览量</Option>
                                                            </Select>
                                                            <Select
                                                                size="small"
                                                                value={sortOrder}
                                                                style={{ width: 80, marginLeft: 8 }}
                                                                onChange={(value) => setSortOrder(value)}
                                                            >
                                                                <Option value="descend">降序</Option>
                                                                <Option value="ascend">升序</Option>
                                                            </Select>
                                                        </div>
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                        >
                                            <Button icon={<FilterOutlined />}>
                                                高级筛选
                                            </Button>
                                        </Dropdown>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                        
                        {viewMode === 'list' ? renderListView() : renderTableView()}
                    </TabPane>
                    <TabPane 
                        tab={
                            <span>
                                <StarOutlined />
                                重点文章
                            </span>
                        } 
                        key="featured"
                    >
                        {viewMode === 'list' ? renderListView() : renderTableView()}
                    </TabPane>
                    <TabPane 
                        tab={
                            <span>
                                <FolderOutlined />
                                带附件文章
                            </span>
                        } 
                        key="withAttachments"
                    >
                        {viewMode === 'list' ? renderListView() : renderTableView()}
                    </TabPane>
                </Tabs>
            </Card>
        </ArticlesContainer>
    );
}

export default ArticlesList;