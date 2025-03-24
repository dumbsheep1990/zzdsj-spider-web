import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Card,
    Spin,
    Tabs,
    Typography,
    Space,
    Tag,
    List,
    Alert
} from 'antd';
import { crawlerAPI } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

function CustomCrawlResult() {
    const { id } = useParams(); // 从URL中获取爬取ID
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);

    useEffect(() => {
        fetchResult();

        // 如果状态是 running，每3秒刷新一次
        const interval = setInterval(() => {
            fetchResult();
        }, 3000);

        setRefreshInterval(interval);

        return () => clearInterval(interval);
    }, [id]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const res = await crawlerAPI.getCustomCrawlResult(id);
            setResult(res.data);
            setLoading(false);

            // 如果爬取完成或出错，停止自动刷新
            if (res.data.status === 'completed' || res.data.status === 'error') {
                clearInterval(refreshInterval);
            }
        } catch (error) {
            console.error('获取爬取结果失败:', error);
            setLoading(false);
            clearInterval(refreshInterval);
        }
    };

    if (loading && !result) {
        return <Spin tip="加载中..." />;
    }

    if (!result) {
        return <div>爬取结果不存在或已被删除</div>;
    }

    return (
        <div className="custom-crawl-result">
            <Title level={4}>单页爬取结果</Title>

            <Card title="爬取信息" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text strong>URL: </Text>
                            <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
                        </div>
                        <div>
                            <Text strong>状态: </Text>
                            {result.status === 'running' ? (
                                <Tag color="blue">处理中</Tag>
                            ) : result.status === 'completed' ? (
                                <Tag color="green">已完成</Tag>
                            ) : (
                                <Tag color="red">出错</Tag>
                            )}
                        </div>
                        <div>
                            <Text strong>爬取时间: </Text>
                            <Text>{new Date(result.crawl_time).toLocaleString()}</Text>
                        </div>
                    </Space>
                </div>

                {result.status === 'running' && (
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <Spin tip="正在处理中，请稍候..." />
                    </div>
                )}

                {result.status === 'error' && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message="爬取出错"
                            description={result.error || '未知错误'}
                            type="error"
                            showIcon
                        />
                    </div>
                )}
            </Card>

            {result.status === 'completed' && (
                <Tabs defaultActiveKey="1">
                    <TabPane tab="提取内容" key="1">
                        <Card>
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>标题: </Text>
                                <Text>{result.title || '无标题'}</Text>
                            </div>

                            <Title level={5}>内容:</Title>
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                {result.content || '无内容'}
                            </div>
                        </Card>
                    </TabPane>

                    {result.extracted_content && (
                        <TabPane tab="LLM提取结果" key="2">
                            <Card>
                                <div style={{ border: '1px solid #f0f0f0', padding: 16, borderRadius: 4, marginBottom: 16 }}>
                                    <pre>{JSON.stringify(result.extracted_content, null, 2)}</pre>
                                </div>
                            </Card>
                        </TabPane>
                    )}

                    {result.links && result.links.length > 0 && (
                        <TabPane tab="发现链接" key="3">
                            <Card>
                                <List
                                    bordered
                                    dataSource={result.links}
                                    renderItem={link => (
                                        <List.Item>
                                            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </TabPane>
                    )}

                    {result.images && result.images.length > 0 && (
                        <TabPane tab="图片" key="4">
                            <Card>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {result.images.map((img, index) => (
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
                            </Card>
                        </TabPane>
                    )}
                </Tabs>
            )}
        </div>
    );
}

export default CustomCrawlResult;