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
    Tooltip,
    Tabs,
    Row,
    Col,
    Switch,
    Divider,
    Radio,
    Tag,
    Alert
} from 'antd';
import { 
    CloudDownloadOutlined, 
    QuestionCircleOutlined, 
    SendOutlined, 
    ApiOutlined, 
    FileTextOutlined,
    FilterOutlined,
    SettingOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { exportAPI } from '../../api';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 添加样式组件
const ExportContainer = styled.div`
  .export-header {
    margin-bottom: 24px;
  }
  
  .export-card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    border-radius: 8px;
    margin-bottom: 24px;
  }
  
  .export-format-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .export-format-option {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 12px 16px;
    transition: all 0.3s;
    cursor: pointer;
    width: 140px;
    text-align: center;
    
    &:hover {
      border-color: #1890ff;
    }
    
    &.selected {
      border-color: #1890ff;
      background-color: #e6f7ff;
    }
    
    .format-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .format-label {
      font-weight: 500;
    }
    
    .format-desc {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      margin-top: 4px;
    }
  }
  
  .api-form {
    background-color: #fafafa;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
  }
  
  .history-item {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .filter-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

// 定义格式图标映射
const formatIcons = {
  json: <i className="fas fa-code" style={{ color: '#1890ff' }}></i>,
  csv: <i className="fas fa-file-csv" style={{ color: '#52c41a' }}></i>,
  excel: <i className="fas fa-file-excel" style={{ color: '#faad14' }}></i>,
  markdown: <i className="fas fa-file-alt" style={{ color: '#722ed1' }}></i>,
  html: <i className="fas fa-file-code" style={{ color: '#eb2f96' }}></i>,
  txt: <i className="fas fa-file-alt" style={{ color: '#bfbfbf' }}></i>
};

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
    const [activeTab, setActiveTab] = useState('export');
    
    // API提交表单状态
    const [apiForm, setApiForm] = useState({
        url: '',
        method: 'POST',
        headers: '',
        bodyType: 'json',
        dataField: 'articles',
        transformData: false
    });
    const [apiSubmitting, setApiSubmitting] = useState(false);
    
    // 模拟的导出历史记录
    const [exportHistory] = useState([
        { id: 1, date: '2023-03-24 14:30', format: 'json', count: 126, size: '2.4MB' },
        { id: 2, date: '2023-03-23 10:15', format: 'excel', count: 87, size: '1.8MB' },
        { id: 3, date: '2023-03-22 09:45', format: 'csv', count: 210, size: '3.1MB' }
    ]);

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

    // 提交数据到自定义API
    const onSubmitToApi = async () => {
        // 验证API URL
        if (!apiForm.url) {
            notification.error({
                message: '提交失败',
                description: '请输入有效的API地址',
            });
            return;
        }
        
        try {
            setApiSubmitting(true);
            
            // 构建查询参数，与导出使用相同的过滤条件
            const params = { format: 'json' }; // 始终使用JSON格式获取数据
            
            if (filters.domain) params.domain = filters.domain;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.keyword) params.keyword = filters.keyword;
            
            // 首先从我们的API获取数据
            const res = await exportAPI.getDataForExport(params);
            
            let dataToSubmit = res.data;
            
            // 如果指定了数据字段，只发送该字段
            if (apiForm.dataField && dataToSubmit[apiForm.dataField]) {
                dataToSubmit = dataToSubmit[apiForm.dataField];
            }
            
            // 准备请求头
            let headers = {
                'Content-Type': apiForm.bodyType === 'json' ? 'application/json' : 'application/x-www-form-urlencoded'
            };
            
            // 添加自定义请求头
            if (apiForm.headers) {
                try {
                    const customHeaders = JSON.parse(apiForm.headers);
                    headers = { ...headers, ...customHeaders };
                } catch (e) {
                    notification.warning({
                        message: '请求头格式无效',
                        description: '使用默认请求头继续提交',
                    });
                }
            }
            
            // 根据选择的方法提交数据
            const response = await fetch(apiForm.url, {
                method: apiForm.method,
                headers: headers,
                body: apiForm.bodyType === 'json' ? JSON.stringify(dataToSubmit) : new URLSearchParams(dataToSubmit)
            });
            
            if (!response.ok) {
                throw new Error(`API响应错误: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            notification.success({
                message: '提交成功',
                description: `数据已成功提交到 ${apiForm.url}`,
            });
            
            // 显示响应详情
            Modal.info({
                title: 'API响应详情',
                content: (
                    <div>
                        <p>状态码: {response.status}</p>
                        <p>响应数据:</p>
                        <pre style={{ maxHeight: 300, overflow: 'auto' }}>
                            {JSON.stringify(responseData, null, 2)}
                        </pre>
                    </div>
                ),
                width: 600,
            });
            
        } catch (error) {
            console.error('提交数据失败:', error);
            notification.error({
                message: '提交失败',
                description: `数据提交失败: ${error.message}`,
            });
        } finally {
            setApiSubmitting(false);
        }
    };
    
    // 渲染导出tab内容
    const renderExportTab = () => (
        <>
            <Card title={
                <span>
                    <CloudDownloadOutlined /> 导出设置
                </span>
            } className="export-card">
                <Form layout="vertical">
                    <Title level={5}>选择导出格式</Title>
                    <div className="export-format-selector">
                        {formatOptions.map(option => (
                            <div 
                                key={option.value}
                                className={`export-format-option ${format === option.value ? 'selected' : ''}`}
                                onClick={() => setFormat(option.value)}
                            >
                                <div className="format-icon">
                                    {formatIcons[option.value] || <FileTextOutlined />}
                                </div>
                                <div className="format-label">{option.label}</div>
                                <div className="format-desc">{option.description}</div>
                            </div>
                        ))}
                    </div>
                    
                    <Divider />
                    
                    <Title level={5}><FilterOutlined /> 筛选条件</Title>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item label="站点选择">
                            <Select
                                placeholder="选择站点"
                                allowClear
                                    style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, domain: value })}
                            >
                                <Option value="www.gzlps.gov.cn">www.gzlps.gov.cn</Option>
                                <Option value="jyj.gzlps.gov.cn">jyj.gzlps.gov.cn</Option>
                                <Option value="zjj.gzlps.gov.cn">zjj.gzlps.gov.cn</Option>
                            </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="时间范围">
                            <RangePicker
                                    style={{ width: '100%' }}
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
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="关键词搜索">
                            <Input.Search
                                placeholder="搜索关键词"
                                allowClear
                                onSearch={(value) => setFilters({ ...filters, keyword: value })}
                            />
                    </Form.Item>
                        </Col>
                    </Row>
                    
                    {(filters.domain || filters.keyword || filters.start_date) && (
                        <div style={{ marginBottom: 16 }}>
                            <Text style={{ marginRight: 8 }}>已选筛选条件:</Text>
                            {filters.domain && (
                                <Tag className="filter-tag" closable onClose={() => setFilters({ ...filters, domain: null })}>
                                    站点: {filters.domain}
                                </Tag>
                            )}
                            {filters.keyword && (
                                <Tag className="filter-tag" closable onClose={() => setFilters({ ...filters, keyword: null })}>
                                    关键词: {filters.keyword}
                                </Tag>
                            )}
                            {filters.start_date && (
                                <Tag className="filter-tag" closable 
                                    onClose={() => setFilters({ ...filters, start_date: null, end_date: null })}>
                                    时间: {filters.start_date} 至 {filters.end_date}
                                </Tag>
                            )}
                        </div>
                    )}
                    
                    <Divider />

                    <Form.Item>
                        <Button
                            type="primary"
                            size="large"
                            onClick={onExport}
                            loading={loading}
                            icon={<CloudDownloadOutlined />}
                        >
                            导出数据
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title={<span><QuestionCircleOutlined /> 导出说明</span>} className="export-card">
                <Paragraph>
                    数据导出功能允许你将爬取的文章数据导出为不同格式，以便进行后续分析和处理。
                    所有导出的数据均经过处理和清洗，确保数据质量。
                </Paragraph>
                <Row gutter={16}>
                    <Col span={12}>
                <Title level={5}>支持的导出格式：</Title>
                <ul>
                            {formatOptions.map(option => (
                                <li key={option.value}>
                                    <Text strong>{option.label}</Text>：{option.description}
                                </li>
                            ))}
                </ul>
                    </Col>
                    <Col span={12}>
                <Title level={5}>注意事项：</Title>
                <ul>
                    <li>导出大量数据可能需要较长时间，请耐心等待</li>
                    <li>可以通过筛选条件缩小导出范围，提高导出速度</li>
                    <li>导出文件中不包含原始HTML内容，以减小文件大小</li>
                            <li>不同格式的文件大小和导出速度可能有所不同</li>
                        </ul>
                    </Col>
                </Row>
            </Card>
        </>
    );
    
    // 渲染API提交tab内容
    const renderApiSubmitTab = () => (
        <>
            <Card title={<span><ApiOutlined /> 数据提交到外部API</span>} className="export-card">
                <Alert 
                    message="此功能允许将已清洗的文章数据提交到您指定的外部API接口" 
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 16 }}
                />
                
                <div className="api-form">
                    <Form layout="vertical">
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item 
                                    label="API地址" 
                                    required
                                    tooltip="输入完整的API URL，包含http://或https://"
                                >
                                    <Input
                                        prefix={<ApiOutlined />}
                                        placeholder="https://example.com/api/articles"
                                        value={apiForm.url}
                                        onChange={e => setApiForm({ ...apiForm, url: e.target.value })}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="请求方法">
                                    <Radio.Group
                                        value={apiForm.method}
                                        onChange={e => setApiForm({ ...apiForm, method: e.target.value })}
                                    >
                                        <Radio.Button value="POST">POST</Radio.Button>
                                        <Radio.Button value="PUT">PUT</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                        
                        <Form.Item label="自定义请求头 (JSON格式)">
                            <Input.TextArea
                                placeholder='{"Authorization": "Bearer your-token", "X-Custom-Header": "value"}'
                                rows={3}
                                value={apiForm.headers}
                                onChange={e => setApiForm({ ...apiForm, headers: e.target.value })}
                            />
                        </Form.Item>
                        
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="请求体格式">
                                    <Radio.Group 
                                        value={apiForm.bodyType}
                                        onChange={e => setApiForm({ ...apiForm, bodyType: e.target.value })}
                                    >
                                        <Radio value="json">JSON</Radio>
                                        <Radio value="form">Form URL Encoded</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label="数据字段名" 
                                    tooltip="指定要发送的数据字段，留空发送全部数据"
                                >
                                    <Input
                                        placeholder="articles"
                                        value={apiForm.dataField}
                                        onChange={e => setApiForm({ ...apiForm, dataField: e.target.value })}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        
                        <Form.Item>
                            <Divider />
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    loading={apiSubmitting}
                                    onClick={onSubmitToApi}
                                >
                                    提交数据
                                </Button>
                                <Text type="secondary">
                                    将使用与导出相同的筛选条件
                                </Text>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
            
            <Card title={<span><SettingOutlined /> 数据提交说明</span>} className="export-card">
                <Paragraph>
                    数据提交功能允许您将已清洗的文章数据直接提交到指定的外部API接口，无需手动下载后再上传。
                </Paragraph>
                <Title level={5}>使用说明：</Title>
                <ul>
                    <li><Text strong>API地址</Text>：输入完整的API URL，必须包含http://或https://</li>
                    <li><Text strong>请求方法</Text>：选择POST（创建新资源）或PUT（更新已有资源）</li>
                    <li><Text strong>自定义请求头</Text>：可选，添加认证Token或其他自定义请求头</li>
                    <li><Text strong>请求体格式</Text>：选择JSON（默认）或Form格式</li>
                    <li><Text strong>数据字段名</Text>：可选，指定要发送的数据字段，留空则发送完整数据</li>
                </ul>
                <Title level={5}>安全提示：</Title>
                <Alert
                    message="确保您有权限向目标API提交数据，并妥善保管您的认证凭据"
                    type="warning"
                    showIcon
                />
            </Card>
        </>
    );
    
    // 渲染历史记录tab内容
    const renderHistoryTab = () => (
        <Card title={<span><HistoryOutlined /> 导出历史记录</span>} className="export-card">
            {exportHistory.length > 0 ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">最近导出的文件记录</Text>
                    </div>
                    {exportHistory.map(item => (
                        <div key={item.id} className="history-item">
                            <Row>
                                <Col span={16}>
                                    <Text strong>导出于 {item.date}</Text>
                                    <br />
                                    <Text type="secondary">
                                        {item.count} 条记录 · {item.size} · 
                                        {formatOptions.find(f => f.value === item.format)?.label || item.format}格式
                                    </Text>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    <Button
                                        type="link"
                                        icon={<CloudDownloadOutlined />}
                                    >
                                        重新下载
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </>
            ) : (
                <Empty description="暂无导出记录" />
            )}
        </Card>
    );

    return (
        <ExportContainer className="data-export">
            <div className="export-header">
                <Title level={4}>数据导出中心</Title>
                <Paragraph>
                    灵活导出已爬取和清洗的文章数据，或将数据提交到自定义API接口进行进一步处理和使用。
                </Paragraph>
        </div>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><CloudDownloadOutlined /> 导出数据</span>} key="export">
                    {renderExportTab()}
                </TabPane>
                <TabPane tab={<span><ApiOutlined /> 提交到API</span>} key="api">
                    {renderApiSubmitTab()}
                </TabPane>
                <TabPane tab={<span><HistoryOutlined /> 导出历史</span>} key="history">
                    {renderHistoryTab()}
                </TabPane>
            </Tabs>
        </ExportContainer>
    );
}

export default DataExport;