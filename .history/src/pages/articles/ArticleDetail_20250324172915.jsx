import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Card,
    Spin,
    Tabs,
    Typography,
    Space,
    Divider,
    Tag,
    List,
    Table,
    Empty,
    Collapse,
    Radio
} from 'antd';
import { articleAPI } from '../../api';
import MarkdownPreview from '../../components/common/MarkdownPreview';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

function ArticleDetail() {
    const { id } = useParams(); // 从URL中获取文章ID
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('text'); // 'text' 或 'markdown'

    useEffect(() => {
        fetchArticleDetail();
    }, [id]);

    const fetchArticleDetail = async () => {
        try {
            setLoading(true);
            const res = await articleAPI.getArticleDetail(id);
            setArticle(res.data);
            setLoading(false);
        } catch (error) {
            console.error('获取文章详情失败:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <Spin tip="加载中..." />;
    }

    if (!article) {
        return <div>文章不存在或已被删除</div>;
    }

    return (
        <div className="article-detail">
            <Card title={article.title || '无标题'} style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                    <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">来源: {article.domain}</Text>
                        {article.publish_date && (
                            <Text type="secondary">发布日期: {article.publish_date}</Text>
                        )}
                        {article.department && (
                            <Text type="secondary">发布部门: {article.department}</Text>
                        )}
                        <Text type="secondary">爬取时间: {new Date(article.crawled_at).toLocaleString()}</Text>
                        {article.is_llm_extracted && (
                            <Tag color="blue">LLM智能提取</Tag>
                        )}
                    </Space>
                </div>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="正文内容" key="1">
                        <div style={{ marginBottom: 16 }}>
                            <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}>
                                <Radio.Button value="text">文本模式</Radio.Button>
                                <Radio.Button value="markdown">Markdown模式</Radio.Button>
                            </Radio.Group>
                        </div>
                        {viewMode === 'text' ? (
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                {article.content || '无内容'}
                            </div>
                        ) : (
                            <MarkdownPreview content={article.content || '无内容'} />
                        )}
                    </TabPane>

                    <TabPane tab="清洗后内容" key="2">
                        <div style={{ marginBottom: 16 }}>
                            <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}>
                                <Radio.Button value="text">文本模式</Radio.Button>
                                <Radio.Button value="markdown">Markdown模式</Radio.Button>
                            </Radio.Group>
                        </div>
                        {viewMode === 'text' ? (
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                {article.cleaned_content || article.processed_content || '未进行数据清洗'}
                            </div>
                        ) : (
                            <MarkdownPreview content={article.cleaned_content || article.processed_content || '未进行数据清洗'} />
                        )}
                        {article.cleaning_method === 'llm' && (
                            <div style={{ marginTop: 16 }}>
                                <Tag color="blue">使用LLM智能清洗</Tag>
                                <Text style={{ marginLeft: 8 }}>
                                    清洗时间: {new Date(article.cleaned_at).toLocaleString()}
                                </Text>
                            </div>
                        )}
                    </TabPane>

                    {article.key_points && article.key_points.length > 0 && (
                        <TabPane tab="关键要点" key="3">
                            <List
                                bordered
                                dataSource={article.key_points}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <Text mark>[{index+1}]</Text> {item}
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    )}

                    <TabPane tab="附件" key="4">
                        {article.attachments && article.attachments.length > 0 ? (
                            <List
                                bordered
                                dataSource={article.attachments}
                                renderItem={item => (
                                    <List.Item>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            {item.filename || item.name} {item.extension ? `(.${item.extension})` : ''}
                                        </a>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="无附件" />
                        )}
                    </TabPane>

                    <TabPane tab="图片" key="5">
                        {article.images && article.images.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {article.images.map((img, index) => (
                                    <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
                                        <img
                                            src={img}
                                            alt={`图片${index + 1}`}
                                            style={{ maxWidth: '300px', maxHeight: '300px' }}
                                        />
                                        <div>
                                            <a href={img} target="_blank" rel="noopener noreferrer">
                                                查看原图
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty description="无图片" />
                        )}
                    </TabPane>

                    <TabPane tab="表格" key="6">
                        {article.extracted_tables && article.extracted_tables.length > 0 ? (
                            <div>
                                {article.extracted_tables.map((table, tableIndex) => (
                                    <div key={tableIndex} style={{ marginBottom: '20px' }}>
                                        <Title level={5}>表格 {tableIndex + 1}</Title>
                                        <Table
                                            dataSource={table.rows.map((row, rowIndex) => ({
                                                key: rowIndex,
                                                ...row.reduce((obj, cell, cellIndex) => {
                                                    obj[`col${cellIndex}`] = cell;
                                                    return obj;
                                                }, {})
                                            }))}
                                            columns={table.headers.length > 0 ?
                                                table.headers.map((header, index) => ({
                                                    title: header,
                                                    dataIndex: `col${index}`,
                                                    key: `col${index}`
                                                })) :
                                                table.rows[0]?.map((_, index) => ({
                                                    title: `列 ${index + 1}`,
                                                    dataIndex: `col${index}`,
                                                    key: `col${index}`
                                                }))
                                            }
                                            pagination={false}
                                            size="small"
                                            bordered
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty description="无表格" />
                        )}
                    </TabPane>

                    <TabPane tab="元数据" key="7">
                        <Collapse>
                            <Panel header="元数据信息" key="1">
                                <pre>{JSON.stringify(article.metadata || {}, null, 2)}</pre>
                            </Panel>
                            <Panel header="原始链接" key="2">
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {article.url}
                                </a>
                            </Panel>
                            {article.raw_html && (
                                <Panel header="原始HTML" key="3">
                                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                        <pre>{article.raw_html}</pre>
                                    </div>
                                </Panel>
                            )}
                        </Collapse>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
}

export default ArticleDetail;