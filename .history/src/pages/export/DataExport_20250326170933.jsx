import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Input,
    Card,
    Tabs,
    Typography,
    Space,
    Tag,
    List,
    Divider,
    notification,
    Collapse,
    Select,
    Upload,
    Progress,
    Table,
    Modal,
    Tooltip,
    Badge,
    Row,
    Col,
    Switch,
    InputNumber,
    Radio,
    Alert,
    DatePicker
} from 'antd';
import {
    CloudDownloadOutlined,
    ApiOutlined,
    HistoryOutlined,
    DownloadOutlined,
    DeleteOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    SendOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { exportAPI } from '../../api';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Dragger } = Upload;
const { RangePicker } = DatePicker;

// 添加样式组件
const ExportContainer = styled.div`
    padding: 24px;
    background: #f0f2f5;
    min-height: 100vh;
`;

const ExportCard = styled(Card)`
    margin-bottom: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ExportFormatOption = styled.div`
    padding: 16px;
    border: 1px solid ${props => props.selected ? '#1890ff' : '#d9d9d9'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 16px;
    background: ${props => props.selected ? '#e6f7ff' : '#fff'};

    &:hover {
        border-color: #1890ff;
    }
`;

const FormatIcon = styled.div`
    font-size: 24px;
    margin-bottom: 8px;
    color: #1890ff;
`;

const FormatLabel = styled.div`
    font-weight: 500;
    margin-bottom: 4px;
`;

const FormatDesc = styled.div`
    color: #666;
    font-size: 12px;
`;

const FilterTag = styled(Tag)`
    margin-right: 8px;
    margin-bottom: 8px;
`;

const HistoryItem = styled.div`
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
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
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [exportHistory, setExportHistory] = useState([]);
    const [showCustomFormatModal, setShowCustomFormatModal] = useState(false);
    const [customFormatForm] = Form.useForm();
    const [submissionMode, setSubmissionMode] = useState('single'); // 'single' or 'batch'
    const [batchSize, setBatchSize] = useState(100);
    const [dateRange, setDateRange] = useState(null);
    const [activeTab, setActiveTab] = useState('export');

    // 获取导出历史
    const fetchExportHistory = async () => {
        try {
            const response = await exportAPI.getHistory();
            setExportHistory(response.data);
        } catch (error) {
            console.error('获取导出历史失败:', error);
        }
    };

    useEffect(() => {
        fetchExportHistory();
    }, []);

    // 处理导出
    const handleExport = async (values) => {
        setLoading(true);
        try {
            const response = await exportAPI.exportData({
                ...values,
                date_range: dateRange,
                submission_mode: submissionMode,
                batch_size: submissionMode === 'batch' ? batchSize : undefined
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `export_${new Date().toISOString()}.${values.format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            notification.success({
                message: '导出成功',
                description: '数据已成功导出。',
            });

            fetchExportHistory();
        } catch (error) {
            console.error('导出失败:', error);
            notification.error({
                message: '导出失败',
                description: error.response?.data?.detail || '导出失败，请重试。',
            });
        } finally {
            setLoading(false);
        }
    };

    // 处理下载
    const handleDownload = async (record) => {
        try {
            const response = await exportAPI.downloadExport(record.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `export_${record.id}.${record.format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('下载失败:', error);
            notification.error({
                message: '下载失败',
                description: error.response?.data?.detail || '下载失败，请重试。',
            });
        }
    };

    // 处理自定义格式保存
    const handleSaveCustomFormat = async () => {
        try {
            const values = await customFormatForm.validateFields();
            await exportAPI.saveCustomFormat(values);
            notification.success({
                message: '保存成功',
                description: '自定义格式已保存。',
            });
            setShowCustomFormatModal(false);
            form.setFieldsValue({ format: values.name });
        } catch (error) {
            console.error('保存自定义格式失败:', error);
            notification.error({
                message: '保存失败',
                description: error.response?.data?.detail || '保存自定义格式失败，请重试。',
            });
        }
    };

    // 处理API提交
    const handleSubmitToApi = async (values) => {
        setLoading(true);
        try {
            await exportAPI.submitToApi({
                ...values,
                date_range: dateRange,
                submission_mode: submissionMode,
                batch_size: submissionMode === 'batch' ? batchSize : undefined
            });

            notification.success({
                message: '提交成功',
                description: '数据已成功提交到API。',
            });

            fetchExportHistory();
        } catch (error) {
            console.error('提交失败:', error);
            notification.error({
                message: '提交失败',
                description: error.response?.data?.detail || '提交失败，请重试。',
            });
        } finally {
            setLoading(false);
        }
    };

    // 处理删除历史记录
    const handleDeleteHistory = async (recordId) => {
        try {
            await exportAPI.deleteHistory(recordId);
            notification.success({
                message: '删除成功',
                description: '导出历史记录已删除。',
            });
            fetchExportHistory();
        } catch (error) {
            console.error('删除历史记录失败:', error);
            notification.error({
                message: '删除失败',
                description: error.response?.data?.detail || '删除历史记录失败，请重试。',
            });
        }
    };

    // 历史记录列定义
    const historyColumns = [
        {
            title: '导出时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: '导出格式',
            dataIndex: 'format',
            key: 'format',
            render: (text) => text.toUpperCase()
        },
        {
            title: '提交方式',
            dataIndex: 'submission_mode',
            key: 'submission_mode',
            render: (text) => (
                <Tag color={text === 'batch' ? 'blue' : 'green'}>
                    {text === 'batch' ? '批次提交' : '单条提交'}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <Badge
                    status={text === 'success' ? 'success' : 'error'}
                    text={text === 'success' ? '成功' : '失败'}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => handleDownload(record)}
                    >
                        下载
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteHistory(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="data-export">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>
                                <DownloadOutlined /> 数据导出
                            </Title>
                            <Text type="secondary">
                                导出数据到文件或提交到外部API
                            </Text>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={16}>
                    <Card>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                {
                                    key: 'export',
                                    label: '导出到文件',
                                    children: (
                                        <Form
                                            form={form}
                                            name="export_form"
                                            onFinish={handleExport}
                                            layout="vertical"
                                        >
                                            <Form.Item
                                                name="format"
                                                label="导出格式"
                                                rules={[{ required: true, message: '请选择导出格式' }]}
                                            >
                                                <Select
                                                    placeholder="选择导出格式"
                                                    options={[
                                                        { label: 'CSV', value: 'csv' },
                                                        { label: 'JSON', value: 'json' },
                                                        { label: 'Excel', value: 'xlsx' },
                                                        { label: '自定义格式', value: 'custom' }
                                                    ]}
                                                    onChange={(value) => {
                                                        if (value === 'custom') {
                                                            setShowCustomFormatModal(true);
                                                        }
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="date_range"
                                                label="数据时间范围"
                                                rules={[{ required: true, message: '请选择数据时间范围' }]}
                                            >
                                                <RangePicker
                                                    showTime
                                                    onChange={(dates) => setDateRange(dates)}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="submission_mode"
                                                label="提交方式"
                                                rules={[{ required: true, message: '请选择提交方式' }]}
                                            >
                                                <Radio.Group
                                                    onChange={(e) => setSubmissionMode(e.target.value)}
                                                    value={submissionMode}
                                                >
                                                    <Radio value="single">单条提交</Radio>
                                                    <Radio value="batch">批次提交</Radio>
                                                </Radio.Group>
                                            </Form.Item>

                                            {submissionMode === 'batch' && (
                                                <Form.Item
                                                    name="batch_size"
                                                    label="批次大小"
                                                    rules={[{ required: true, message: '请输入批次大小' }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        max={1000}
                                                        value={batchSize}
                                                        onChange={setBatchSize}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            )}

                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={loading}
                                                    icon={<DownloadOutlined />}
                                                >
                                                    开始导出
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    )
                                },
                                {
                                    key: 'api',
                                    label: '提交到API',
                                    children: (
                                        <Form
                                            form={form}
                                            name="api_submit_form"
                                            onFinish={handleSubmitToApi}
                                            layout="vertical"
                                        >
                                            <Form.Item
                                                name="api_url"
                                                label="API地址"
                                                rules={[
                                                    { required: true, message: '请输入API地址' },
                                                    { type: 'url', message: '请输入有效的URL地址' }
                                                ]}
                                            >
                                                <Input placeholder="请输入API地址" />
                                            </Form.Item>

                                            <Form.Item
                                                name="api_key"
                                                label="API密钥"
                                                rules={[{ required: true, message: '请输入API密钥' }]}
                                            >
                                                <Input.Password placeholder="请输入API密钥" />
                                            </Form.Item>

                                            <Form.Item
                                                name="format"
                                                label="数据格式"
                                                rules={[{ required: true, message: '请选择数据格式' }]}
                                            >
                                                <Select
                                                    placeholder="选择数据格式"
                                                    options={[
                                                        { label: 'JSON', value: 'json' },
                                                        { label: 'XML', value: 'xml' },
                                                        { label: '自定义格式', value: 'custom' }
                                                    ]}
                                                    onChange={(value) => {
                                                        if (value === 'custom') {
                                                            setShowCustomFormatModal(true);
                                                        }
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="date_range"
                                                label="数据时间范围"
                                                rules={[{ required: true, message: '请选择数据时间范围' }]}
                                            >
                                                <RangePicker
                                                    showTime
                                                    onChange={(dates) => setDateRange(dates)}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="submission_mode"
                                                label="提交方式"
                                                rules={[{ required: true, message: '请选择提交方式' }]}
                                            >
                                                <Radio.Group
                                                    onChange={(e) => setSubmissionMode(e.target.value)}
                                                    value={submissionMode}
                                                >
                                                    <Radio value="single">单条提交</Radio>
                                                    <Radio value="batch">批次提交</Radio>
                                                </Radio.Group>
                                            </Form.Item>

                                            {submissionMode === 'batch' && (
                                                <Form.Item
                                                    name="batch_size"
                                                    label="批次大小"
                                                    rules={[{ required: true, message: '请输入批次大小' }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        max={1000}
                                                        value={batchSize}
                                                        onChange={setBatchSize}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            )}

                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={loading}
                                                    icon={<ApiOutlined />}
                                                >
                                                    提交到API
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    )
                                },
                                {
                                    key: 'history',
                                    label: '导出历史',
                                    children: (
                                        <Table
                                            dataSource={exportHistory}
                                            columns={historyColumns}
                                            rowKey="id"
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="使用说明">
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="导出格式说明" key="1">
                                <Paragraph>
                                    支持以下导出格式：
                                </Paragraph>
                                <ul>
                                    <li>CSV：适用于表格数据，支持Excel打开</li>
                                    <li>JSON：适用于结构化数据，支持程序处理</li>
                                    <li>Excel：支持多sheet和复杂格式</li>
                                    <li>自定义格式：可根据需求自定义数据格式</li>
                                </ul>
                            </Panel>
                            <Panel header="API提交说明" key="2">
                                <Paragraph>
                                    提交到API时需要注意：
                                </Paragraph>
                                <ul>
                                    <li>确保API地址正确且可访问</li>
                                    <li>提供有效的API密钥</li>
                                    <li>选择合适的数据格式</li>
                                    <li>根据API要求设置提交方式</li>
                                </ul>
                            </Panel>
                            <Panel header="最佳实践" key="3">
                                <Paragraph>
                                    使用数据导出功能时，建议遵循以下最佳实践：
                                </Paragraph>
                                <ul>
                                    <li>选择合适的数据格式和提交方式</li>
                                    <li>合理设置数据时间范围</li>
                                    <li>定期清理导出历史</li>
                                    <li>保存常用的自定义格式</li>
                                </ul>
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="自定义格式"
                open={showCustomFormatModal}
                onOk={handleSaveCustomFormat}
                onCancel={() => setShowCustomFormatModal(false)}
            >
                <Form
                    form={customFormatForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="格式名称"
                        rules={[{ required: true, message: '请输入格式名称' }]}
                    >
                        <Input placeholder="请输入格式名称" />
                    </Form.Item>
                    <Form.Item
                        name="template"
                        label="格式模板"
                        rules={[{ required: true, message: '请输入格式模板' }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="请输入格式模板，使用 {field} 表示字段"
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="格式描述"
                    >
                        <TextArea
                            rows={3}
                            placeholder="请输入格式描述"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default DataExport;