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

    // 文件格式选项
    const formatOptions = [
        { value: 'json', label: 'JSON', description: '完整的数据结构，包含所有字段' },
        { value: 'csv', label: 'CSV', description: '表格格式，适合在Excel等工具中查看' },
        { value: 'excel', label: 'Excel', description: '直接导出为Excel文件' },
        { value: 'markdown', label: 'Markdown', description: 'Markdown格式，适合文档展示' },
        { value: 'html', label: 'HTML', description: 'HTML格式，保留原始样式' },
        { value: 'txt', label: 'TXT', description: '纯文本格式，仅包含正文内容' }
    ];

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
            apiForm.setFieldsValue({ format: values.name });
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
        <ExportContainer className="data-export">
            <div className="export-header">
                <Title level={4}>数据导出中心</Title>
                <Paragraph>
                    灵活导出已爬取和清洗的文章数据，或将数据提交到自定义API接口进行进一步处理和使用。
                </Paragraph>
            </div>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><CloudDownloadOutlined /> 导出数据</span>} key="export">
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
                                icon={<CloudDownloadOutlined />}
                            >
                                开始导出
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab={<span><ApiOutlined /> 提交到API</span>} key="api">
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
                </TabPane>
                <TabPane tab={<span><HistoryOutlined /> 导出历史</span>} key="history">
                    <Table
                        dataSource={exportHistory}
                        columns={historyColumns}
                        rowKey="id"
                    />
                </TabPane>
            </Tabs>

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
        </ExportContainer>
    );
}

export default DataExport;