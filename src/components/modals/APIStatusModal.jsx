import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, List, Typography, Tag, Button, Space, Spin, Divider, Alert, Badge } from 'antd';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    QuestionCircleFilled,
    ReloadOutlined,
    ApiOutlined,
    CloudServerOutlined,
    DesktopOutlined,
    SaveOutlined,
    AppstoreOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { systemAPI, llmAPI, vectorAPI } from '../../api';

const { Text, Title, Paragraph } = Typography;

function APIStatusModal({ visible, onCancel, setLLMSettingsModalVisible }) {
    const { settings, checkAPIStatus } = useGlobalSettings();
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState(settings.llmSettings?.useServerConfig ? 'model' : 'base');
    const [diagnostics, setDiagnostics] = useState(null);
    const [localApiItems, setLocalApiItems] = useState([]);
    const [cloudApiItems, setCloudApiItems] = useState([]);
    const [proxyApiItems, setProxyApiItems] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const hasCheckedRef = useRef(false);
    const [loading, setLoading] = useState(false);

    // 添加一个useMemo钩子来缓存是否使用后端配置的状态
    const isUsingServerConfig = useMemo(() => {
        try {
            const savedSettings = localStorage.getItem('globalSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.llmSettings?.useServerConfig === true;
            }
        } catch (error) {
            console.error('读取localStorage失败:', error);
        }
        return settings.llmSettings?.useServerConfig === true;
    }, [visible, settings.llmSettings?.useServerConfig]); // 仅在模态框打开时重新计算

    // 检查API状态
    const checkApiStatusManual = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        console.log('【DEBUG】正在执行检查API状态检查...');
        setChecking(true);
        try {
            // 获取系统状态
            const systemStatus = await systemAPI.getStatus();
            console.log('System status response:', systemStatus.data);
            
            // 直接使用globalSettingsContext的新方法进行检查
            await checkAPIStatus();
            
            // 获取资源使用信息
            const resourceUsage = await systemAPI.getResourceUsage();
            console.log('Resource usage response:', resourceUsage.data);
            
            // 获取日志
            const logs = await systemAPI.getLogs({ limit: 5 });
            console.log('Logs response:', logs.data);
            
            // 构造诊断信息
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
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // 当弹窗显示时自动检查状态
    useEffect(() => {
        if (visible && !hasCheckedRef.current) {
            console.log('【DEBUG】首次打开API状态对话框，初始化检查状态');
            hasCheckedRef.current = true;
            // 使用setTimeout延迟执行，确保界面已渲染
            setTimeout(() => {
                checkApiStatusManual(false); // 传入false参数不显示loading状态
            }, 300);
        } else if (!visible) {
            // 当对话框关闭时重置检查状态标志
            hasCheckedRef.current = false;
        }
    }, [visible]);

    // 添加更多的调试信息
    useEffect(() => {
        // u4ec5u5728u663eu793au72b6u6001u53d8u5316u65f6u6253u5370u8c03u8bd5u4fe1u606f - u4feeu590du65e0u9650u5237u65b0u95eeu9898
        if (visible) {
            console.log('【DEBUG】API状态对话框打开:', visible);
            console.log('【DEBUG】当前全局设置:', settings);
            console.log('【DEBUG】是否使用后端配置:', isUsingServerConfig);
            console.log('【DEBUG】当前选中的Tab:', activeTab);
            
            // u5982u679cu542fu7528u4e86u540eu7aefu4ee3u7406uff0cu81eau52a8u9009u4e2du540eu7aefu4ee3u7406u6807u7b7e
            if (isUsingServerConfig && activeTab !== 'model') {
                console.log('【DEBUG】自动切换到后端代理标签页');
                setActiveTab('model');
            }
        }
    }, [visible]); // u79fbu9664u4f9du8d56u9879u4e2du7684settingsu548csettings.llmSettings?.useServerConfig

    // 初始化API状态项目
    useEffect(() => {
        if (visible) {
            console.log('【DEBUG】API状态对话框打开，初始化服务列表');
            
            // 初始化基础服务列表
            const localItems = [
                {
                    key: 'crawler',
                    title: '爬虫服务',
                    description: '负责资源爬取的基础服务',
                    status: settings.apiStatus?.crawler || 'unknown',
                    useServerConfig: false
                },
                {
                    key: 'resource',
                    title: '资源监控服务',
                    description: '监控系统资源使用情况的服务',
                    status: settings.apiStatus?.resource || 'unknown',
                    useServerConfig: false
                }
            ];

            // 初始化模型服务列表
            const modelItems = [
                {
                    key: 'cloud',
                    title: '云服务 LLM',
                    description: 'OpenAI、Azure 或 Anthropic 等云端服务',
                    status: settings.apiStatus?.cloud || 'unknown',
                    useServerConfig: settings.llmSettings?.useServerConfig
                },
                {
                    key: 'ollama',
                    title: 'Ollama 本地模型',
                    description: '本地 Ollama 服务连接状态',
                    status: settings.apiStatus?.ollama || 'unknown',
                    useServerConfig: false
                },
                {
                    key: 'custom',
                    title: '自定义 API',
                    description: '自定义 LLM API 服务连接状态',
                    status: settings.apiStatus?.custom || 'unknown',
                    useServerConfig: false
                },
                {
                    key: 'vector',
                    title: '向量数据库',
                    description: '向量数据库连接状态',
                    status: settings.apiStatus?.vector || 'unknown',
                    useServerConfig: settings.llmSettings?.useServerConfig
                },
                {
                    key: 'proxy',
                    title: '后端代理服务',
                    description: '基于后端服务器的LLM代理服务',
                    status: isUsingServerConfig ? (settings.apiStatus?.proxy || 'unknown') : 'disabled',
                    useServerConfig: true
                }
            ];

            // 设置服务项
            setLocalApiItems(localItems);
            setCloudApiItems(modelItems.filter(item => item.key !== 'proxy'));
            setProxyApiItems(modelItems.filter(item => item.key === 'proxy' || settings.llmSettings?.useServerConfig));
            
            // 计算错误数量
            setErrorCount([
                ...localItems,
                ...modelItems
            ].filter(item => item.status === 'error' || item.status === 'not_connected').length);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, settings.apiStatus, settings.llmSettings?.useServerConfig]);

    // u81eau52a8u5207u6362u6807u7b7eu9875
    useEffect(() => {
        if (visible && isUsingServerConfig && activeTab !== 'model') {
            console.log('u3010DEBUGu3011u68c0u6d4bu5230u4f7fu7528u540eu7aefu4ee3u7406uff0cu81eau52a8u5207u6362u6807u7b7eu9875');
            setActiveTab('model');
        }
    }, [visible, isUsingServerConfig]);

    // u6dfbu52a0u8c03u8bd5u51fdu6570
    const debugRenderTag = (item) => {
        console.log(`Rendering tag for ${item.key}:`, {
            useServerConfig: item.useServerConfig,
            globalUseServerConfig: settings.llmSettings?.useServerConfig,
            shouldShowTag: (item.useServerConfig || settings.llmSettings?.useServerConfig)
        });
        return (item.useServerConfig || settings.llmSettings?.useServerConfig);
    };

    // u6e32u67d3u4e91u670du52a1u914du7f6e
    const renderCloudConfig = () => {
        // 如果使用服务器配置，则显示特定信息
        if (isUsingServerConfig) {
            return (
                <Alert
                    message="正在使用服务器代理模式"
                    description={
                        <>
                            <p>当前所有LLM与向量模型请求将通过后端代理服务处理。</p>
                            {settings.llmSettings.serverConfig && (
                                <p>
                                    <strong>主要模型服务：</strong> {settings.llmSettings.serverConfig.primary_service || '未指定'}
                                    <br />
                                    <strong>可用的LLM服务：</strong> {Object.keys(settings.llmSettings.serverConfig.llm_services || {}).join(', ') || '无可用服务'}
                                </p>
                            )}
                        </>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            );
        }

        return (
            <Alert
                message="模型服务配置说明"
                description="云端LLM服务和向量服务的API配置请在“LLM模型设置”中配置。在此页面可以查看各云服务的状态。"
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
            />
        );
    };

    // 获取状态标签
    const getStatusTag = (status) => {
        switch(status) {
            case 'connected':
                return <Tag color="success" icon={<CheckCircleFilled />}>已连接</Tag>;
            case 'disconnected':
                return <Tag color="error" icon={<CloseCircleFilled />}>未连接</Tag>;
            case 'not_configured':
                return <Tag color="warning" icon={<QuestionCircleFilled />}>未配置</Tag>;
            case 'disabled':
                return <Tag color="default">未启用</Tag>;
            case 'error':
                return <Tag color="error" icon={<CloseCircleFilled />}>错误</Tag>;
            default:
                return <Tag color="default" icon={<QuestionCircleFilled />}>未知</Tag>;
        }
    };

    // 渲染诊断信息
    const renderDiagnostics = () => {
        if (!diagnostics) {
            return <Alert message="无诊断信息" description="正在加载诊断信息" type="info" showIcon />;
        }
        
        try {
            const { lastCheck, systemStatus, resourceUsage, logs } = diagnostics;
            
            // 资源使用信息的健壮性检查
            if (!systemStatus || !resourceUsage) {
                return <Alert message="资源信息不完整" description="无法获取系统状态或资源使用信息" type="warning" showIcon />;
            }
            
            console.log('【DEBUG】系统状态数据:', systemStatus);
            console.log('【DEBUG】资源使用数据:', resourceUsage);
            
            // 构造系统状态信息
            const status = systemStatus.status || 'unknown';
            const timestamp = systemStatus.timestamp || 'N/A';
            const sysInfo = systemStatus.system_info || {};
            const os = sysInfo.os || 'N/A';
            const osVersion = sysInfo.os_version || 'N/A';
            const pythonVersion = sysInfo.python_version || 'N/A';
            const hostname = sysInfo.hostname || 'N/A';
            
            // 构造资源使用信息
            let cpuDisplay = 'N/A';
            let memoryDisplay = 'N/A';
            let diskDisplay = 'N/A';
            let networkSent = 'N/A';
            let networkRecv = 'N/A';
            
            // 检查资源使用信息的健壮性并构造显示值
            if (resourceUsage && typeof resourceUsage === 'object') {
                const resources = resourceUsage.resources || resourceUsage;
                
                // CPU
                if (resources.cpu_percent !== undefined) {
                    cpuDisplay = `${resources.cpu_percent}%`;
                } else if (resources.cpu !== undefined) {
                    if (typeof resources.cpu === 'object' && resources.cpu.percent !== undefined) {
                        cpuDisplay = `${resources.cpu.percent}%`;
                    } else if (typeof resources.cpu === 'number') {
                        cpuDisplay = `${resources.cpu}%`;
                    }
                }
                
                // 内存 - 添加对更深层次结构的支持
                if (resources.memory_percent !== undefined) {
                    memoryDisplay = `${resources.memory_percent}%`;
                } else if (resources.memory !== undefined) {
                    if (typeof resources.memory === 'object') {
                        // 检查深层结构: memory.virtual.percent
                        if (resources.memory.virtual && resources.memory.virtual.percent !== undefined) {
                            memoryDisplay = `${resources.memory.virtual.percent}%`;
                        } else if (resources.memory.percent !== undefined) {
                            memoryDisplay = `${resources.memory.percent}%`;
                        }
                    } else if (typeof resources.memory === 'number') {
                        memoryDisplay = `${resources.memory}%`;
                    }
                }
                
                // 磁盘 - 添加对更深层次结构的支持
                if (resources.disk_percent !== undefined) {
                    diskDisplay = `${resources.disk_percent}%`;
                } else if (resources.disk !== undefined) {
                    if (typeof resources.disk === 'object') {
                        // 检查深层结构: disk.usage.percent
                        if (resources.disk.usage && resources.disk.usage.percent !== undefined) {
                            diskDisplay = `${resources.disk.usage.percent}%`;
                        } else if (resources.disk.percent !== undefined) {
                            diskDisplay = `${resources.disk.percent}%`;
                        }
                    } else if (typeof resources.disk === 'number') {
                        diskDisplay = `${resources.disk}%`;
                    }
                }
                
                // 网络 - 添加对更深层次结构的支持
                if (resources.network_sent !== undefined) {
                    networkSent = resources.network_sent;
                } else if (resources.network !== undefined) {
                    if (typeof resources.network === 'object') {
                        if (resources.network.sent !== undefined) {
                            networkSent = resources.network.sent;
                        } else if (resources.network.bytes_sent !== undefined) {
                            networkSent = resources.network.bytes_sent;
                        } else if (resources.network.tx !== undefined) {
                            networkSent = resources.network.tx;
                        }
                    }
                }
                
                if (resources.network_recv !== undefined) {
                    networkRecv = resources.network_recv;
                } else if (resources.network !== undefined) {
                    if (typeof resources.network === 'object') {
                        if (resources.network.recv !== undefined) {
                            networkRecv = resources.network.recv;
                        } else if (resources.network.bytes_recv !== undefined) {
                            networkRecv = resources.network.bytes_recv;
                        } else if (resources.network.rx !== undefined) {
                            networkRecv = resources.network.rx;
                        }
                    }
                }
                
                // u6253u5370u89e3u6790u540eu7684u6570u636e
                console.log('【DEBUG】解析后的资源信息：', {
                    cpuDisplay,
                    memoryDisplay,
                    diskDisplay,
                    networkSent: formatBytes(networkSent),
                    networkRecv: formatBytes(networkRecv)
                });
            }
            
            // 构造服务状态信息
            const services = systemStatus.services || [];
            let serviceInfo = '';
            
            if (Array.isArray(services) && services.length > 0) {
                serviceInfo = services.map(service => 
                    `${service.name || '服务名称'}: ${service.status || '服务状态'} (${service.version || 'N/A'})`
                ).join('\n');
            } else {
                serviceInfo = '无服务信息';
            }
            
            // 构造日志信息
            let logInfo = '无日志信息';
            if (Array.isArray(logs) && logs.length > 0) {
                logInfo = logs.map(log => {
                    const time = log.timestamp || log.time || '';
                    const msg = log.message || log.content || log.text || '';
                    return `[${time}] ${msg}`;
                }).join('\n');
            }
            
            // 渲染诊断信息
            return (
                <pre style={{
                    background: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflow: 'auto',
                    fontSize: '12px'
                }}>
                    {`最后检查时间: ${lastCheck}
系统状态: ${status} (${timestamp})
主机: ${hostname}
操作系统: ${os} ${osVersion}
Python版本: ${pythonVersion}

资源使用情况:
CPU使用率: ${cpuDisplay}
内存使用率: ${memoryDisplay}
磁盘使用率: ${diskDisplay}
网络状态: 发送 ${formatBytes(networkSent)}, 接收 ${formatBytes(networkRecv)}

服务状态:
${serviceInfo}

最近日志:
${logInfo}`}
                </pre>
            );
            
        } catch (error) {
            // 捕获并显示解析错误
            console.error('诊断信息渲染错误:', error);
            return (
                <Alert
                    message="诊断信息解析错误"
                    description={`解析诊断信息时发生错误：${error.message}`}
                    type="error"
                    showIcon
                />
            );
        }
    };
    
    // u5b57u8282u8f6cu6362u5de5u5177u51fdu6570
    const formatBytes = (bytes) => {
        if (bytes === undefined || bytes === null || bytes === '' || isNaN(bytes) || bytes === 'N/A') {
            return 'N/A';
        }
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Modal
            title={
                <Space>
                    <ApiOutlined />
                    <span>API 连接状态</span>
                    {errorCount > 0 && (
                        <Tag color="error">{errorCount} 个服务异常</Tag>
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
                    loading={checking || loading}
                    onClick={checkApiStatusManual}
                >
                    刷新状态
                </Button>
            ]}
        >
            <Spin spinning={checking || loading}>
                <Paragraph>
                    请确保所有必要的 API 服务正常运行，如果服务状态异常，请检查 API 配置并重新连接。
                </Paragraph>

                <div className="api-status-section" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <Space>
                            <Button 
                                type={activeTab === 'base' ? 'primary' : 'default'}
                                icon={<AppstoreOutlined />}
                                onClick={() => setActiveTab('base')}
                            >
                                基础服务
                            </Button>
                            <Button 
                                type={activeTab === 'model' ? 'primary' : 'default'}
                                icon={<RobotOutlined />}
                                onClick={() => setActiveTab('model')}
                            >
                                模型服务 {isUsingServerConfig && (
                                    <Tag color="red" icon={<ApiOutlined />} style={{ fontWeight: 'bold', marginLeft: 4 }}>
                                        服务器代理
                                    </Tag>
                                )}
                            </Button>
                        </Space>
                    </div>

                    <div className="api-status-content">
                        {activeTab === 'base' && (
                            <List
                                itemLayout="horizontal"
                                dataSource={localApiItems}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    {item.title} {getStatusTag(item.status)}
                                                </Space>
                                            }
                                            description={item.description}
                                        />
                                        {item.status !== 'connected' &&
                                            <Button 
                                                size="small" 
                                                type="link"
                                                onClick={checkApiStatusManual}
                                            >
                                                刷新状态
                                            </Button>
                                        }
                                    </List.Item>
                                )}
                            />
                        )}

                        {activeTab === 'model' && (
                            <div>
                                {renderCloudConfig()}
                                <List
                                    itemLayout="horizontal"
                                    dataSource={isUsingServerConfig ? proxyApiItems : cloudApiItems}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={
                                                    <Space>
                                                        {item.title} {getStatusTag(item.status)}
                                                        {item.useServerConfig && (
                                                            <Tag color="red" icon={<ApiOutlined />} style={{ fontWeight: 'bold', marginLeft: 4 }}>
                                                                服务器代理
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                }
                                                description={item.description}
                                            />
                                            {item.status !== 'connected' && (
                                                <Button 
                                                    size="small" 
                                                    type="link"
                                                    onClick={() => {
                                                        if(item.status === 'not_configured' && !isUsingServerConfig) {
                                                            onCancel();
                                                            setLLMSettingsModalVisible(true);
                                                        } else {
                                                            checkApiStatusManual();
                                                        }
                                                    }}
                                                >
                                                    {item.status === 'not_configured' && !isUsingServerConfig ? '配置' : '刷新状态'}
                                                </Button>
                                            )}
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    <Divider />

                    <Title level={5}>配置信息</Title>
                    {renderDiagnostics()}
                </div>

            </Spin>
        </Modal>
    );
}

export default APIStatusModal;