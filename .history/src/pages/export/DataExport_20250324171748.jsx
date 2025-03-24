import React, { useState } from 'react';
import {
    Form,
    Button,
    Select,
    Input,
    DatePicker,
    Card,
    Typography,
    Space,
    notification,
    Modal,
    Tooltip
} from 'antd';
import { CloudDownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { exportAPI } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function DataExport() {
    const [format, setFormat] = useState('json');
    const [filters, setFilters] = useState({
        domain: null,
        start_date: null,
        end_date: null,
        keyword: null
    });
    const [loading, setLoading] = useState(false);
    const [exportUrl, setExportUrl] = useState(null);

    // 文件格式选项
    const formatOptions = [
        { value: 'json', label: 'JSON', description: '完整的数据结构，包含所有字段' },
        { value: 'csv', label: 'CSV', description: '表格格式，适合在Excel等工具中查看' },
        { value: 'excel', label: 'Excel', description: '直接导出为Excel文件' },
        { value: 'markdown', label: 'Markdown', description: 'Markdown格式，适合文档展示' },
        { value: 'html', label: 'HTML', description: 'HTML格式，保留原始样式' },
        { value: 'txt', label: 'TXT', description: '纯文本格式，仅包含正文内容' }
    ];

    const onExport = async () => {
        try {
            setLoading(true);

            // 构建查询参数
            const params = { format };

            if (filters.domain) params.domain = filters.domain;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.keyword) params.keyword = filters.keyword;

            const res = await exportAPI.exportData(params);

            setExportUrl(res.data.export_url);
            setLoading(false);

            // 创建下载链接
            const API_BASE_URL = 'http://localhost:8000'; // 应从配置中获取
            const downloadUrl = `${API_BASE_URL}${res.data.export_url}`;

            // 显示下载确认
            Modal.confirm({
                title: '导出成功',
                content: '数据已准备好，点击确定开始下载。',
                onOk() {
                    window.location.href = downloadUrl;
                }
            });

        } catch (error) {
            console.error('导出数据失败:', error);
            notification.error({
                message: '导出失败',
                description: '数据导出失败，请重试。',
            });
            setLoading(false);
        }
    };

    return (
        <div className="data-export">
            <Title level={4}>数据导出</Title>
            <Paragraph>
                导出爬取的文章数据为不同格式，以便进行后续分析和处理。
            </Paragraph>

            <Card title="数据导出" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                    <Form.Item 
                        label={
                            <span>
                                导出格式
                                <Tooltip title="选择最适合你需求的导出格式">
                                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                </Tooltip>
                            </span>
                        }
                    >
                        <Select
                            value={format}
                            onChange={setFormat}
                            style={{ width: 200 }}
                            options={formatOptions}
                        />
                    </Form.Item>

                    <Form.Item label="筛选条件">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Select
                                placeholder="选择站点"
                                allowClear
                                style={{ width: 200 }}
                                onChange={(value) => setFilters({ ...filters, domain: value })}
                            >
                                <Option value="www.gzlps.gov.cn">www.gzlps.gov.cn</Option>
                                <Option value="jyj.gzlps.gov.cn">jyj.gzlps.gov.cn</Option>
                                <Option value="zjj.gzlps.gov.cn">zjj.gzlps.gov.cn</Option>
                                {/* 更多子站点选项可动态加载 */}
                            </Select>

                            <RangePicker
                                onChange={(dates) => {
                                    if (dates) {
                                        setFilters({
                                            ...filters,
                                            start_date: dates[0]?.format('YYYY-MM-DD'),
                                            end_date: dates[1]?.format('YYYY-MM-DD')
                                        });
                                    } else {
                                        setFilters({
                                            ...filters,
                                            start_date: null,
                                            end_date: null
                                        });
                                    }
                                }}
                            />

                            <Input.Search
                                placeholder="搜索关键词"
                                allowClear
                                onSearch={(value) => setFilters({ ...filters, keyword: value })}
                                style={{ width: 300 }}
                            />
                        </Space>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={onExport}
                            loading={loading}
                            icon={<CloudDownloadOutlined />}
                        >
                            导出数据
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="导出说明">
                <Paragraph>
                    数据导出功能允许你将爬取的文章数据导出为不同格式，以便进行后续分析和处理。
                </Paragraph>
                <Title level={5}>支持的导出格式：</Title>
                <ul>
                    {formatOptions.map(option => (
                        <li key={option.value}>
                            <Text strong>{option.label}</Text>：{option.description}
                        </li>
                    ))}
                </ul>
                <Title level={5}>注意事项：</Title>
                <ul>
                    <li>导出大量数据可能需要较长时间，请耐心等待</li>
                    <li>可以通过筛选条件缩小导出范围，提高导出速度</li>
                    <li>导出文件中不包含原始HTML内容，以减小文件大小</li>
                    <li>不同格式的文件大小和导出速度可能有所不同</li>
                </ul>
            </Card>
        </div>
    );
}

export default DataExport;