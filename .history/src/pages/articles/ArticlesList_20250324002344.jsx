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
    Tag
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { articleAPI } from '../../api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
        keyword: null
    });

    useEffect(() => {
        fetchArticles();
    }, [page, pageSize, filters]);

    const fetchArticles = async () => {
        try {
            setLoading(true);

            // 构建查询参数
            const params = {
                page,
                page_size: pageSize
            };

            if (filters.domain) params.domain = filters.domain;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.keyword) params.keyword = filters.keyword;

            const res = await articleAPI.getArticles(params);

            setArticles(res.data.data);
            setTotal(res.data.total);
            setLoading(false);
        } catch (error) {
            console.error('获取文章列表失败:', error);
            setLoading(false);
        }
    };

    const onFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setPage(1); // 重置分页
    };

    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <a onClick={() => navigate(`/article/${record._id}`)}>{text || '无标题'}</a>
            )
        },
        {
            title: '站点',
            dataIndex: 'domain',
            key: 'domain',
        },
        {
            title: '发布日期',
            dataIndex: 'publish_date',
            key: 'publish_date',
            render: (text) => text || '未知'
        },
        {
            title: '提取方式',
            dataIndex: 'is_llm_extracted',
            key: 'is_llm_extracted',
            render: (text) => (
                text ? <Tag color="blue">LLM智能提取</Tag> : <Tag>常规提取</Tag>
            )
        },
        {
            title: '爬取时间',
            dataIndex: 'crawled_at',
            key: 'crawled_at',
            render: (text) => new Date(text).toLocaleString()
        }
    ];

    return (
        <div className="articles-list">
            <Title level={4}>文章列表</Title>
            <Paragraph>
                查看和管理已爬取的文章内容，支持按关键词、站点和日期筛选。
            </Paragraph>

            <Card title="文章列表" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Input.Search
                            placeholder="搜索关键词"
                            allowClear
                            onSearch={(value) => onFilterChange({ keyword: value })}
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder="选择站点"
                            allowClear
                            style={{ width: 200 }}
                            onChange={(value) => onFilterChange({ domain: value })}
                        >
                            <Option value="www.gzlps.gov.cn">www.gzlps.gov.cn</Option>
                            <Option value="jyj.gzlps.gov.cn">jyj.gzlps.gov.cn</Option>
                            <Option value="zjj.gzlps.gov.cn">zjj.gzlps.gov.cn</Option>
                            {/* 更多子站点选项可动态加载 */}
                        </Select>
                        <RangePicker
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
                                    keyword: null
                                });
                                setPage(1);
                                fetchArticles();
                            }}
                        >
                            重置筛选
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: (p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        },
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                />
            </Card>
        </div>
    );
}

export default ArticlesList;