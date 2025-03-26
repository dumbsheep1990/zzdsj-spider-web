import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Button, Space, Spin, Divider, Tabs, Alert } from 'antd';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    QuestionCircleFilled,
    ReloadOutlined,
    ApiOutlined,
    CloudServerOutlined,
    DesktopOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { systemAPI, llmAPI, vectorAPI } from '../../api';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function APIStatusModal({ visible, onCancel, setLLMSettingsModalVisible }) {
    const { settings, checkAPIStatus } = useGlobalSettings();
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState('local');
    const [diagnostics, setDiagnostics] = useState(null);

    // 检查API状态
    const checkApiStatusManual = async () => {
        setChecking(true);
        try {
            // 获取系统状态
            const systemStatus = await systemAPI.getStatus();
            
            // 获取LLM服务状态
            const llmStatus = await llmAPI.testConnection(settings.llmSettings);
            
            // 获取向量化服务状态
            const vectorStatus = await vectorAPI.testConnection(settings.vectorSettings);
            
            // 更新状态
            await checkAPIStatus();
            
            // 获取诊断信息
            const resourceUsage = await systemAPI.getResourceUsage();
            const logs = await systemAPI.getLogs({ limit: 5 });
            
            setDiagnostics({
                lastCheck: new Date().toLocaleString(),
                systemStatus: systemStatus.data,
                resourceUsage: resourceUsage.data,
                logs: logs.data
            });
        } catch (error) {
            console.error('检查API状态失败:', error);
        } finally {
            setChecking(false);
        }
    };

    // 当弹窗显示时自动检查状态
    useEffect(() => {
        if (visible) {
            checkApiStatusManual();
        }
    }, [visible]);

    // 云服务API状态数据
    const cloudApiItems = [
        {
            title: 'Deepseek API',
            status: settings?.llmSettings?.cloud?.provider === 'deepseek' && settings?.llmSettings?.cloud?.apiKey ? 'configured' : 'not_configured',
            description: 'Deepseek 大语言模型服务',
            key: 'deepseek'
        },
        {
            title: '豆包 API',
            status: settings?.llmSettings?.cloud?.provider === 'doubao' && settings?.llmSettings?.cloud?.apiKey ? 'configured' : 'not_configured',
            description: '豆包大语言模型服务',
            key: 'doubao'
        },
        {
            title: '阿里云 API',
            status: settings?.llmSettings?.cloud?.provider === 'aliyun' && settings?.llmSettings?.cloud?.apiKey ? 'configured' : 'not_configured',
            description: '阿里云通义千问服务',
            key: 'aliyun'
        },
        {
            title: '智谱 API',
            status: settings?.llmSettings?.cloud?.provider === 'zhipu' && settings?.llmSettings?.cloud?.apiKey ? 'configured' : 'not_configured',
            description: '智谱 GLM 大语言模型服务',
            key: 'zhipu'
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

    // 计算错误项数量
    const errorCount = allApiItems.filter(
        item => item.status !== 'connected' && item.status !== 'unknown'
    ).length;

    // 获取状态标签
    const getStatusTag = (status) => {
        switch(status) {
            case 'configured':
                return <Tag color="success">已配置</Tag>;
            case 'not_configured':
                return <Tag color="warning">未配置</Tag>;
            case 'connected':
                return <Tag color="success">已连接</Tag>;
            case 'disconnected':
                return <Tag color="error">未连接</Tag>;
            case 'error':
                return <Tag color="error">错误</Tag>;
            default:
                return <Tag color="default">未知</Tag>;
        }
    };

    // 渲染诊断信息
    const renderDiagnostics = () => {
        if (!diagnostics) {
            return <Spin />;
        }

        return (
            <pre style={{
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '150px',
                overflow: 'auto',
                fontSize: '12px'
            }}>
                {`最后检查时间: ${diagnostics.lastCheck}
系统状态: ${diagnostics.systemStatus.status}
CPU使用率: ${diagnostics.resourceUsage.cpu}%
内存使用率: ${diagnostics.resourceUsage.memory}%
磁盘使用率: ${diagnostics.resourceUsage.disk}%
网络状态: ${diagnostics.resourceUsage.network}
系统版本: ${diagnostics.resourceUsage.version}
最近日志:
${diagnostics.logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n')}`}
            </pre>
        );
    };

    // 渲染云服务配置
    const renderCloudConfig = () => {
        return (
            <div>
                <Alert
                    message="云端LLM服务配置说明"
                    description="云端LLM服务的API配置请在「LLM模型设置」中进行管理。在这里您可以查看各服务的配置状态。"
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                <List
                    itemLayout="horizontal"
                    dataSource={cloudApiItems}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={<Space>{item.title} {getStatusTag(item.status)}</Space>}
                                description={item.description}
                            />
                            {item.status === 'not_configured' && (
                                <Button
                                    size="small"
                                    type="link"
                                    onClick={() => {
                                        onCancel();
                                        setLLMSettingsModalVisible(true);
                                    }}
                                >
                                    前往配置
                                </Button>
                            )}
                        </List.Item>
                    )}
                />
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
                    <TabPane
                        tab={
                            <>
                                <DesktopOutlined /> 本地服务
                            </>
                        }
                        key="local"
                    />
                    <TabPane
                        tab={
                            <>
                                <CloudServerOutlined /> 云端LLM服务
                            </>
                        }
                        key="cloud"
                    />
                </Tabs>

                {activeTab === 'cloud' ? (
                    renderCloudConfig()
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={[...localApiItems, ...systemApiItems]}
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