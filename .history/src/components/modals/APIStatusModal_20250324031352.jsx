import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Button, Space, Spin, Divider, Tabs, Form, Input, Select } from 'antd';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    QuestionCircleFilled,
    ReloadOutlined,
    ApiOutlined,
    SettingOutlined,
    CloudServerOutlined,
    DesktopOutlined,
    ApartmentOutlined
} from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function APIStatusModal({ visible, onCancel }) {
    const { settings, checkAPIStatus } = useGlobalSettings();
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [form] = Form.useForm();

    // 模拟检查API状态
    const checkApiStatusManual = () => {
        setChecking(true);

        // 模拟API检查延迟
        setTimeout(async () => {
            await checkAPIStatus();
            setChecking(false);
        }, 1500);
    };

    // 当弹窗显示时自动检查状态
    useEffect(() => {
        if (visible) {
            checkApiStatusManual();
        }
    }, [visible]);

    // 状态标签
    const getStatusTag = (status) => {
        switch(status) {
            case 'connected':
                return <Tag icon={<CheckCircleFilled />} color="success">已连接</Tag>;
            case 'disconnected':
                return <Tag icon={<CloseCircleFilled />} color="error">未连接</Tag>;
            case 'error':
                return <Tag icon={<CloseCircleFilled />} color="error">错误</Tag>;
            default:
                return <Tag icon={<QuestionCircleFilled />} color="warning">未知</Tag>;
        }
    };

    // 云服务API状态数据
    const cloudApiItems = [
        {
            title: 'Deepseek API',
            status: settings.apiStatus?.deepseek || 'unknown',
            description: 'Deepseek 大语言模型服务',
            key: 'deepseek'
        },
        {
            title: '豆包 API',
            status: settings.apiStatus?.doubao || 'unknown',
            description: '豆包大语言模型服务',
            key: 'doubao'
        },
        {
            title: '阿里云 API',
            status: settings.apiStatus?.aliyun || 'unknown',
            description: '阿里云通义千问服务',
            key: 'aliyun'
        },
        {
            title: '百度 API',
            status: settings.apiStatus?.baidu || 'unknown',
            description: '百度文心一言服务',
            key: 'baidu'
        }
    ];

    // 本地服务API状态数据
    const localApiItems = [
        {
            title: 'Ollama API',
            status: settings.apiStatus?.ollama || 'unknown',
            description: '本地LLM服务 (Llama, Mistral等)',
            key: 'ollama'
        }
    ];

    // 系统API状态数据
    const systemApiItems = [
        {
            title: '爬虫后端服务',
            status: settings.apiStatus?.backend || 'unknown',
            description: '系统核心服务',
            key: 'backend'
        }
    ];

    // 所有API状态数据
    const allApiItems = [...cloudApiItems, ...localApiItems, ...systemApiItems];

    // 获取当前需要展示的API项
    const getCurrentApiItems = () => {
        switch(activeTab) {
            case 'cloud':
                return cloudApiItems;
            case 'local':
                return localApiItems;
            case 'system':
                return systemApiItems;
            default:
                return allApiItems;
        }
    };

    // 计算错误项数量
    const errorCount = allApiItems.filter(
        item => item.status !== 'connected' && item.status !== 'unknown'
    ).length;

    // 渲染诊断信息
    const renderDiagnostics = () => {
        // 模拟一些诊断数据
        const diagnosticData = {
            lastCheck: new Date().toLocaleString(),
            responseTimes: {
                deepseek: Math.floor(Math.random() * 300 + 100),
                doubao: Math.floor(Math.random() * 300 + 100),
                aliyun: Math.floor(Math.random() * 300 + 100),
                baidu: Math.floor(Math.random() * 300 + 100),
                ollama: Math.floor(Math.random() * 100 + 20),
                backend: Math.floor(Math.random() * 50 + 10)
            },
            networkStatus: Math.random() > 0.1 ? '正常' : '异常',
            systemVersion: 'v1.0.0'
        };

        return (
            <pre style={{
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '150px',
                overflow: 'auto',
                fontSize: '12px'
            }}>
        {`最后检查时间: ${diagnosticData.lastCheck}
响应时间: Deepseek(${diagnosticData.responseTimes.deepseek}ms), 豆包(${diagnosticData.responseTimes.doubao}ms), 阿里云(${diagnosticData.responseTimes.aliyun}ms), 百度(${diagnosticData.responseTimes.baidu}ms), Ollama(${diagnosticData.responseTimes.ollama}ms), Backend(${diagnosticData.responseTimes.backend}ms)
网络状态: ${diagnosticData.networkStatus}
系统版本: ${diagnosticData.systemVersion}`}
      </pre>
        );
    };

    // 云服务API配置表单
    const renderCloudConfig = () => {
        return (
            <div>
                <Tabs
                    defaultActiveKey="deepseek"
                    type="card"
                    style={{ marginBottom: '16px' }}
                >
                    <TabPane tab="Deepseek" key="deepseek">
                        <Form layout="vertical">
                            <Form.Item label="API Key" name={['deepseek', 'apiKey']}>
                                <Input.Password placeholder="请输入 Deepseek API Key" />
                            </Form.Item>
                            <Form.Item label="API 地址" name={['deepseek', 'apiUrl']}>
                                <Input placeholder="请输入 Deepseek API 地址" />
                            </Form.Item>
                            <Form.Item label="模型" name={['deepseek', 'model']}>
                                <Select placeholder="请选择模型">
                                    <Select.Option value="deepseek-chat">Deepseek Chat</Select.Option>
                                    <Select.Option value="deepseek-coder">Deepseek Coder</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="豆包" key="doubao">
                        <Form layout="vertical">
                            <Form.Item label="API Key" name={['doubao', 'apiKey']}>
                                <Input.Password placeholder="请输入豆包 API Key" />
                            </Form.Item>
                            <Form.Item label="API 地址" name={['doubao', 'apiUrl']}>
                                <Input placeholder="请输入豆包 API 地址" />
                            </Form.Item>
                            <Form.Item label="模型" name={['doubao', 'model']}>
                                <Select placeholder="请选择模型">
                                    <Select.Option value="doubao-text">豆包文本模型</Select.Option>
                                    <Select.Option value="doubao-code">豆包代码模型</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="阿里云" key="aliyun">
                        <Form layout="vertical">
                            <Form.Item label="Access Key" name={['aliyun', 'accessKey']}>
                                <Input.Password placeholder="请输入阿里云 Access Key" />
                            </Form.Item>
                            <Form.Item label="Access Secret" name={['aliyun', 'accessSecret']}>
                                <Input.Password placeholder="请输入阿里云 Access Secret" />
                            </Form.Item>
                            <Form.Item label="模型" name={['aliyun', 'model']}>
                                <Select placeholder="请选择模型">
                                    <Select.Option value="qwen-turbo">通义千问 Turbo</Select.Option>
                                    <Select.Option value="qwen-plus">通义千问 Plus</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="百度" key="baidu">
                        <Form layout="vertical">
                            <Form.Item label="API Key" name={['baidu', 'apiKey']}>
                                <Input.Password placeholder="请输入百度 API Key" />
                            </Form.Item>
                            <Form.Item label="Secret Key" name={['baidu', 'secretKey']}>
                                <Input.Password placeholder="请输入百度 Secret Key" />
                            </Form.Item>
                            <Form.Item label="模型" name={['baidu', 'model']}>
                                <Select placeholder="请选择模型">
                                    <Select.Option value="ernie-bot">文心一言</Select.Option>
                                    <Select.Option value="ernie-bot-4">文心一言 4.0</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <ApiOutlined />
                    <span>API 连接状态</span>
                    {errorCount > 0 && (
                        <Tag color="error">{errorCount}个服务异常</Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            width={700}
            footer={[
                <Button key="settings" icon={<SettingOutlined />} onClick={() => {}}>
                    配置API密钥
                </Button>,
                <Button
                    key="refresh"
                    type="primary"
                    icon={<ReloadOutlined />}
                    loading={checking}
                    onClick={checkApiStatusManual}
                >
                    刷新状态
                </Button>
            ]}
        >
            <Spin spinning={checking}>
                <Paragraph>
                    系统依赖以下API服务正常运行。如果某项服务显示未连接或错误状态，请检查API密钥设置和网络连接。
                </Paragraph>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ marginBottom: '16px' }}
                >
                    <TabPane tab="所有服务" key="all" />
                    <TabPane
                        tab={
                            <>
                                <CloudServerOutlined /> 云服务API
                            </>
                        }
                        key="cloud"
                    />
                    <TabPane
                        tab={
                            <>
                                <DesktopOutlined /> 本地服务API
                            </>
                        }
                        key="local"
                    />
                    <TabPane
                        tab={
                            <>
                                <ApartmentOutlined /> 系统服务
                            </>
                        }
                        key="system"
                    />
                </Tabs>

                {activeTab === 'cloud' ? (
                    renderCloudConfig()
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={getCurrentApiItems()}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<Space>{item.title} {getStatusTag(item.status)}</Space>}
                                    description={item.description}
                                />
                                {item.status !== 'connected' &&
                                    <Button size="small" type="link">
                                        故障排除
                                    </Button>
                                }
                            </List.Item>
                        )}
                    />
                )}

                <Divider />

                <Title level={5}>诊断信息</Title>
                {renderDiagnostics()}
            </Spin>
        </Modal>
    );
}

export default APIStatusModal;