import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Tag, Button, Space, Spin, Divider, Tabs } from 'antd';
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
    const allApiItems = [...localApiItems, ...systemApiItems];

    // 获取当前需要展示的API项
    const getCurrentApiItems = () => {
        switch(activeTab) {
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
响应时间: Ollama(${diagnosticData.responseTimes.ollama}ms), Backend(${diagnosticData.responseTimes.backend}ms)
网络状态: ${diagnosticData.networkStatus}
系统版本: ${diagnosticData.systemVersion}`}
      </pre>
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

                <Divider />

                <Title level={5}>诊断信息</Title>
                {renderDiagnostics()}
            </Spin>
        </Modal>
    );
}

export default APIStatusModal;