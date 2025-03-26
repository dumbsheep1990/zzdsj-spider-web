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
    Statistic,
    Row,
    Col,
    Switch,
    InputNumber,
    Radio,
    Alert
} from 'antd';
import {
    DatabaseOutlined,
    UploadOutlined,
    HistoryOutlined,
    SaveOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ReloadOutlined,
    PlusOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    SearchOutlined,
    SettingOutlined,
    ApiOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { vectorAPI } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Dragger } = Upload;

function Vectorization() {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('config');
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState(null);
    const [models, setModels] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [history, setHistory] = useState([]);
    const [rebuildProgress, setRebuildProgress] = useState(null);
    const [batchProgress, setBatchProgress] = useState(null);
    const [batchResults, setBatchResults] = useState([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateForm] = Form.useForm();
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // 获取配置
    const fetchConfig = async () => {
        try {
            const response = await vectorAPI.getConfig();
            setConfig(response.data);
            form.setFieldsValue(response.data);
        } catch (error) {
            console.error('获取配置失败:', error);
        }
    };

    // 获取统计信息
    const fetchStats = async () => {
        try {
            const response = await vectorAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('获取统计信息失败:', error);
        }
    };

    // 获取模型列表
    const fetchModels = async () => {
        try {
            const response = await vectorAPI.getModels();
            setModels(response.data);
        } catch (error) {
            console.error('获取模型列表失败:', error);
        }
    };

    // 获取模板列表
    const fetchTemplates = async () => {
        try {
            const response = await vectorAPI.getTemplates();
            setTemplates(response.data);
        } catch (error) {
            console.error('获取模板列表失败:', error);
        }
    };

    // 获取历史记录
    const fetchHistory = async () => {
        try {
            const response = await vectorAPI.getHistory();
            setHistory(response.data);
        } catch (error) {
            console.error('获取历史记录失败:', error);
        }
    };

    useEffect(() => {
        fetchConfig();
        fetchStats();
        fetchModels();
        fetchTemplates();
        fetchHistory();
    }, []);

    // 保存配置
    const handleSaveConfig = async (values) => {
        try {
            await vectorAPI.saveConfig(values);
            notification.success({
                message: '保存成功',
                description: '向量化配置已保存。',
            });
            fetchConfig();
        } catch (error) {
            console.error('保存配置失败:', error);
            notification.error({
                message: '保存失败',
                description: error.response?.data?.detail || '保存配置失败，请重试。',
            });
        }
    };

    // 测试连接
    const handleTestConnection = async () => {
        try {
            const values = await form.validateFields();
            await vectorAPI.testConnection(values);
            notification.success({
                message: '连接成功',
                description: '向量化服务连接测试通过。',
            });
        } catch (error) {
            console.error('连接测试失败:', error);
            notification.error({
                message: '连接失败',
                description: error.response?.data?.detail || '连接测试失败，请检查配置。',
            });
        }
    };

    // 重建索引
    const handleRebuildIndex = async () => {
        try {
            const values = await form.validateFields();
            const response = await vectorAPI.rebuildIndex(values);
            const taskId = response.data.task_id;
            setRebuildProgress({ taskId, status: 'processing', progress: 0 });

            // 开始轮询进度
            const pollProgress = setInterval(async () => {
                const progressResponse = await vectorAPI.getProgress(taskId);
                const progress = progressResponse.data;

                if (progress.status === 'completed') {
                    clearInterval(pollProgress);
                    setRebuildProgress({ ...progress, status: 'completed' });
                    notification.success({
                        message: '重建完成',
                        description: '向量索引重建完成。',
                    });
                    fetchStats();
                } else if (progress.status === 'failed') {
                    clearInterval(pollProgress);
                    setRebuildProgress({ ...progress, status: 'failed' });
                    notification.error({
                        message: '重建失败',
                        description: progress.error || '向量索引重建失败。',
                    });
                } else {
                    setRebuildProgress({ ...progress, status: 'processing' });
                }
            }, 2000);
        } catch (error) {
            console.error('重建索引失败:', error);
            notification.error({
                message: '重建失败',
                description: error.response?.data?.detail || '重建索引失败，请重试。',
            });
        }
    };

    // 批量向量化
    const handleBatchVectorize = async (file) => {
        try {
            const values = await form.validateFields();
            const response = await vectorAPI.batchVectorize({
                file: file,
                ...values
            });

            const taskId = response.data.task_id;
            setBatchProgress({ taskId, status: 'processing', progress: 0 });

            // 开始轮询进度
            const pollProgress = setInterval(async () => {
                const progressResponse = await vectorAPI.getBatchProgress(taskId);
                const progress = progressResponse.data;

                if (progress.status === 'completed') {
                    clearInterval(pollProgress);
                    setBatchProgress({ ...progress, status: 'completed' });
                    const resultsResponse = await vectorAPI.getBatchResults(taskId);
                    setBatchResults(resultsResponse.data);
                    notification.success({
                        message: '批量向量化完成',
                        description: '所有内容已成功向量化。',
                    });
                    fetchStats();
                } else if (progress.status === 'failed') {
                    clearInterval(pollProgress);
                    setBatchProgress({ ...progress, status: 'failed' });
                    notification.error({
                        message: '批量向量化失败',
                        description: progress.error || '批量向量化过程中发生错误。',
                    });
                } else {
                    setBatchProgress({ ...progress, status: 'processing' });
                }
            }, 2000);

            return false; // 阻止自动上传
        } catch (error) {
            console.error('批量向量化失败:', error);
            notification.error({
                message: '批量向量化失败',
                description: error.response?.data?.detail || '批量向量化失败，请重试。',
            });
            return false;
        }
    };

    // 向量相似度搜索
    const handleSearch = async (values) => {
        try {
            const response = await vectorAPI.similaritySearch(values);
            setSearchResults(response.data);
            setShowSearchModal(true);
        } catch (error) {
            console.error('搜索失败:', error);
            notification.error({
                message: '搜索失败',
                description: error.response?.data?.detail || '搜索失败，请重试。',
            });
        }
    };

    // 保存模板
    const handleSaveTemplate = async () => {
        try {
            const values = await templateForm.validateFields();
            await vectorAPI.saveTemplate(values);
            notification.success({
                message: '保存成功',
                description: '向量化模板已保存。',
            });
            setShowTemplateModal(false);
            fetchTemplates();
        } catch (error) {
            console.error('保存模板失败:', error);
            notification.error({
                message: '保存失败',
                description: error.response?.data?.detail || '保存模板失败，请重试。',
            });
        }
    };

    // 删除模板
    const handleDeleteTemplate = async (templateId) => {
        try {
            await vectorAPI.deleteTemplate(templateId);
            notification.success({
                message: '删除成功',
                description: '向量化模板已删除。',
            });
            fetchTemplates();
        } catch (error) {
            console.error('删除模板失败:', error);
            notification.error({
                message: '删除失败',
                description: error.response?.data?.detail || '删除模板失败，请重试。',
            });
        }
    };

    // 导出结果
    const handleExport = async () => {
        try {
            const response = await vectorAPI.exportResults({
                format: 'json'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'vectorization_results.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('导出失败:', error);
            notification.error({
                message: '导出失败',
                description: error.response?.data?.detail || '导出失败，请重试。',
            });
        }
    };

    // 删除记录
    const handleDeleteRecord = async (recordId) => {
        try {
            await vectorAPI.deleteRecord(recordId);
            notification.success({
                message: '删除成功',
                description: '向量化记录已删除。',
            });
            fetchHistory();
        } catch (error) {
            console.error('删除记录失败:', error);
            notification.error({
                message: '删除失败',
                description: error.response?.data?.detail || '删除记录失败，请重试。',
            });
        }
    };

    // 历史记录列定义
    const historyColumns = [
        {
            title: '向量化时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: '向量化方式',
            dataIndex: 'mode',
            key: 'mode',
            render: (text) => (
                <Tag color={text === 'batch' ? 'blue' : 'green'}>
                    {text === 'batch' ? '批量向量化' : '单条向量化'}
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
                        onClick={() => handleExport(record)}
                    >
                        导出
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteRecord(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="vectorization">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>
                                <DatabaseOutlined /> 数据向量化
                            </Title>
                            <Text type="secondary">
                                将文本内容转换为向量，支持相似度搜索和智能匹配
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
                                    key: 'config',
                                    label: '向量化配置',
                                    children: (
                                        <Form
                                            form={form}
                                            name="vector_config_form"
                                            onFinish={handleSaveConfig}
                                            layout="vertical"
                                            initialValues={config}
                                        >
                                            <Form.Item
                                                name="provider"
                                                label="向量化服务提供商"
                                                rules={[{ required: true, message: '请选择向量化服务提供商' }]}
                                            >
                                                <Select
                                                    placeholder="选择向量化服务提供商"
                                                    options={[
                                                        { label: 'Milvus', value: 'milvus' },
                                                        { label: 'Pinecone', value: 'pinecone' },
                                                        { label: 'Weaviate', value: 'weaviate' },
                                                        { label: 'Qdrant', value: 'qdrant' }
                                                    ]}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="model"
                                                label="向量化模型"
                                                rules={[{ required: true, message: '请选择向量化模型' }]}
                                            >
                                                <Select
                                                    placeholder="选择向量化模型"
                                                    options={models}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="dimension"
                                                label="向量维度"
                                                rules={[{ required: true, message: '请输入向量维度' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={2048}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="batch_size"
                                                label="批处理大小"
                                                rules={[{ required: true, message: '请输入批处理大小' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={1000}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="max_retries"
                                                label="最大重试次数"
                                                rules={[{ required: true, message: '请输入最大重试次数' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    max={5}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="timeout"
                                                label="超时时间(秒)"
                                                rules={[{ required: true, message: '请输入超时时间' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={60}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="enable_cache"
                                                label="启用缓存"
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>

                                            <Form.Item
                                                name="cache_ttl"
                                                label="缓存过期时间(小时)"
                                                rules={[{ required: form.getFieldValue('enable_cache'), message: '请输入缓存过期时间' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={24}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        icon={<SaveOutlined />}
                                                    >
                                                        保存配置
                                                    </Button>
                                                    <Button
                                                        icon={<ApiOutlined />}
                                                        onClick={handleTestConnection}
                                                    >
                                                        测试连接
                                                    </Button>
                                                    <Button
                                                        icon={<ReloadOutlined />}
                                                        onClick={handleRebuildIndex}
                                                        loading={rebuildProgress?.status === 'processing'}
                                                    >
                                                        重建索引
                                                    </Button>
                                                </Space>
                                            </Form.Item>

                                            {rebuildProgress && (
                                                <Card style={{ marginTop: 16 }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Space>
                                                            <Text>重建进度</Text>
                                                            {rebuildProgress.status === 'processing' && (
                                                                <LoadingOutlined />
                                                            )}
                                                            {rebuildProgress.status === 'completed' && (
                                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                            )}
                                                            {rebuildProgress.status === 'failed' && (
                                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                            )}
                                                        </Space>
                                                        <Progress
                                                            percent={rebuildProgress.progress}
                                                            status={
                                                                rebuildProgress.status === 'completed'
                                                                    ? 'success'
                                                                    : rebuildProgress.status === 'failed'
                                                                    ? 'exception'
                                                                    : 'active'
                                                            }
                                                        />
                                                    </Space>
                                                </Card>
                                            )}
                                        </Form>
                                    )
                                },
                                {
                                    key: 'batch',
                                    label: '批量向量化',
                                    children: (
                                        <div>
                                            <Dragger
                                                accept=".txt,.csv,.json"
                                                beforeUpload={handleBatchVectorize}
                                                showUploadList={false}
                                            >
                                                <p className="ant-upload-drag-icon">
                                                    <UploadOutlined />
                                                </p>
                                                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                                                <p className="ant-upload-hint">
                                                    支持 .txt、.csv 或 .json 文件
                                                </p>
                                            </Dragger>

                                            {batchProgress && (
                                                <Card style={{ marginTop: 16 }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Space>
                                                            <Text>向量化进度</Text>
                                                            {batchProgress.status === 'processing' && (
                                                                <LoadingOutlined />
                                                            )}
                                                            {batchProgress.status === 'completed' && (
                                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                            )}
                                                            {batchProgress.status === 'failed' && (
                                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                            )}
                                                        </Space>
                                                        <Progress
                                                            percent={batchProgress.progress}
                                                            status={
                                                                batchProgress.status === 'completed'
                                                                    ? 'success'
                                                                    : batchProgress.status === 'failed'
                                                                    ? 'exception'
                                                                    : 'active'
                                                            }
                                                        />
                                                    </Space>
                                                </Card>
                                            )}

                                            {batchResults.length > 0 && (
                                                <Card style={{ marginTop: 16 }}>
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Space>
                                                            <Text>向量化结果</Text>
                                                            <Button
                                                                type="link"
                                                                icon={<DownloadOutlined />}
                                                                onClick={handleExport}
                                                            >
                                                                导出结果
                                                            </Button>
                                                        </Space>
                                                        <Table
                                                            dataSource={batchResults}
                                                            columns={[
                                                                {
                                                                    title: 'ID',
                                                                    dataIndex: 'id',
                                                                    key: 'id'
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
                                                                    title: '错误信息',
                                                                    dataIndex: 'error',
                                                                    key: 'error',
                                                                    ellipsis: true
                                                                }
                                                            ]}
                                                        />
                                                    </Space>
                                                </Card>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'search',
                                    label: '相似度搜索',
                                    children: (
                                        <Form
                                            name="vector_search_form"
                                            onFinish={handleSearch}
                                            layout="vertical"
                                        >
                                            <Form.Item
                                                name="query"
                                                label="搜索内容"
                                                rules={[{ required: true, message: '请输入搜索内容' }]}
                                            >
                                                <TextArea rows={4} placeholder="请输入要搜索的内容" />
                                            </Form.Item>

                                            <Form.Item
                                                name="top_k"
                                                label="返回结果数量"
                                                rules={[{ required: true, message: '请输入返回结果数量' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={100}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="min_score"
                                                label="最小相似度分数"
                                                rules={[{ required: true, message: '请输入最小相似度分数' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    icon={<SearchOutlined />}
                                                >
                                                    开始搜索
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    )
                                },
                                {
                                    key: 'history',
                                    label: '历史记录',
                                    children: (
                                        <Table
                                            dataSource={history}
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
                    <Card title="统计信息">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Statistic
                                title="总向量数"
                                value={stats?.total_vectors || 0}
                                prefix={<DatabaseOutlined />}
                            />
                            <Statistic
                                title="今日向量化"
                                value={stats?.today_vectors || 0}
                                prefix={<PlusOutlined />}
                            />
                            <Statistic
                                title="索引大小"
                                value={stats?.index_size || 0}
                                suffix="MB"
                                prefix={<BarChartOutlined />}
                            />
                            <Statistic
                                title="平均响应时间"
                                value={stats?.avg_response_time || 0}
                                suffix="ms"
                                prefix={<ApiOutlined />}
                            />
                        </Space>
                    </Card>

                    <Card title="向量化模板" style={{ marginTop: 16 }}>
                        <List
                            dataSource={templates}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                form.setFieldsValue(item.config);
                                            }}
                                        >
                                            使用
                                        </Button>,
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteTemplate(item.id)}
                                        >
                                            删除
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={item.name}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card title="使用说明" style={{ marginTop: 16 }}>
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="向量化原理" key="1">
                                <Paragraph>
                                    向量化是将文本内容转换为高维向量的过程。通过使用预训练的语言模型，
                                    我们可以将文本的语义信息编码为向量表示，从而实现相似度搜索和智能匹配。
                                </Paragraph>
                            </Panel>
                            <Panel header="配置说明" key="2">
                                <Paragraph>
                                    向量化配置包含以下重要参数：
                                </Paragraph>
                                <ul>
                                    <li>向量化服务提供商：选择使用的向量数据库</li>
                                    <li>向量化模型：选择用于生成向量的语言模型</li>
                                    <li>向量维度：生成的向量维度大小</li>
                                    <li>批处理大小：每次处理的文本数量</li>
                                    <li>最大重试次数：失败时的重试次数</li>
                                    <li>超时时间：单次请求的超时时间</li>
                                </ul>
                            </Panel>
                            <Panel header="最佳实践" key="3">
                                <Paragraph>
                                    使用向量化功能时，建议遵循以下最佳实践：
                                </Paragraph>
                                <ul>
                                    <li>选择合适的向量化模型，平衡效果和性能</li>
                                    <li>根据数据量调整批处理大小</li>
                                    <li>定期重建索引以优化性能</li>
                                    <li>使用模板保存常用配置</li>
                                    <li>监控向量化统计信息</li>
                                </ul>
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="保存向量化模板"
                open={showTemplateModal}
                onOk={handleSaveTemplate}
                onCancel={() => setShowTemplateModal(false)}
            >
                <Form
                    form={templateForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="模板名称"
                        rules={[{ required: true, message: '请输入模板名称' }]}
                    >
                        <Input placeholder="请输入模板名称" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="模板描述"
                    >
                        <TextArea rows={3} placeholder="请输入模板描述" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="相似度搜索结果"
                open={showSearchModal}
                onCancel={() => setShowSearchModal(false)}
                width={800}
                footer={null}
            >
                <List
                    dataSource={searchResults}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text mark>[{index + 1}]</Text>
                                        <Text>相似度: {item.score.toFixed(4)}</Text>
                                    </Space>
                                }
                                description={item.content}
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
}

export default Vectorization; 