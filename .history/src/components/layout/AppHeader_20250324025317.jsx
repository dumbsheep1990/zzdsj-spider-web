import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout, Typography, Space, Button, Badge, Dropdown, Tooltip, Avatar, Divider } from 'antd';
import {
    ApiOutlined,
    SettingOutlined,
    UserOutlined,
    RobotOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    QuestionCircleFilled,
    DownOutlined,
    GlobalOutlined,
    BellOutlined
} from '@ant-design/icons';
import APIStatusModal from '../modals/APIStatusModal';
import LLMSettingsModal from '../modals/LLMSettingsModal';
import AppLogo from '../common/AppLogo';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const { Header } = Layout;
const { Text } = Typography;

// 样式化组件
const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(90deg, #001529 0%, #003a70 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderButton = styled(Button)`
  color: white !important;
  &:hover {
    color: #1890ff !important;
  }
`;

const ModelTag = styled.div`
  background: rgba(24, 144, 255, 0.2);
  border-radius: 16px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerticalDivider = styled(Divider)`
  height: 24px;
  border-color: rgba(255, 255, 255, 0.3);
`;

function AppHeader() {
    const [apiStatusModalVisible, setApiStatusModalVisible] = useState(false);
    const [llmSettingsModalVisible, setLLMSettingsModalVisible] = useState(false);

    // 使用全局设置上下文
    const { settings, checkAPIStatus } = useGlobalSettings();

    // 获取当前启用的LLM提供商
    const getActiveLLMProvider = () => {
        const { activeProvider } = settings.llmSettings;
        switch(activeProvider) {
            case 'cloud':
                return '云服务 LLM';
            case 'ollama':
                return 'Ollama 本地模型';
            case 'custom':
                return '自定义 API';
            default:
                return '云服务 LLM';
        }
    };

    // 获取当前启用的模型
    const getActiveModel = () => {
        const { activeProvider } = settings.llmSettings;
        const config = settings.llmSettings[activeProvider];
        return config?.model || 'gpt-3.5-turbo';
    };

    // API状态图标
    // const getApiStatusIcon = (status) => {
    //     switch(status) {
    //         case 'connected':
    //             return <CheckCircleFilled style={{ color: '#52c41a' }} />;
    //         case 'disconnected':
    //             return <CloseCircleFilled style={{ color: '#f5222d' }} />;
    //         default:
    //             return <QuestionCircleFilled style={{ color: '#faad14' }} />;
    //     }
    // };

    // 定期检查API状态
    useEffect(() => {
        // 首次加载时检查API状态
        checkAPIStatus();

        // 每5分钟检查一次
        const interval = setInterval(() => {
            checkAPIStatus();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // 设置下拉菜单
    const settingsMenu = {
        items: [
            {
                key: '1',
                label: (
                    <div style={{ padding: '8px 0' }}>
                        <Space>
                            <RobotOutlined />
                            <Text>LLM模型设置</Text>
                        </Space>
                    </div>
                ),
                onClick: () => setLLMSettingsModalVisible(true)
            }
        ]
    };

    // API状态异常数量
    const apiIssueCount = Object.values(settings.apiStatus || {})
        .filter(status => status !== 'connected' && status !== 'unknown')
        .length;

    return (
        <StyledHeader>
            <AppLogo />

            <HeaderRight>
                {/* 当前使用的LLM提供商和模型 */}
                <ModelTag>
                    <RobotOutlined />
                    <Text style={{ color: 'white' }}>
                        {getActiveLLMProvider()} / {getActiveModel()}
                    </Text>
                </ModelTag>

                {/* API状态指示器 */}
                <Tooltip title="API连接状态">
                    <Badge
                        count={apiIssueCount || 0}
                        offset={[-5, 5]}
                    >
                        <HeaderButton
                            icon={<ApiOutlined />}
                            type="text"
                            onClick={() => setApiStatusModalVisible(true)}
                        >
                            API状态
                        </HeaderButton>
                    </Badge>
                </Tooltip>

                {/* 设置按钮 */}
                <Dropdown menu={settingsMenu} trigger={['click']}>
                    <HeaderButton
                        icon={<SettingOutlined />}
                        type="text"
                    >
                        设置 <DownOutlined />
                    </HeaderButton>
                </Dropdown>

                <VerticalDivider type="vertical" />

                {/* 用户信息 */}
                <Space>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{
                            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)'
                        }}
                    />
                    <Text style={{ color: 'white' }}>管理员</Text>
                </Space>
            </HeaderRight>

            {/* API状态弹窗 */}
            <APIStatusModal
                visible={apiStatusModalVisible}
                onCancel={() => setApiStatusModalVisible(false)}
                apiStatus={settings.apiStatus || {}}
            />

            {/* LLM设置弹窗 */}
            <LLMSettingsModal
                visible={llmSettingsModalVisible}
                onCancel={() => setLLMSettingsModalVisible(false)}
            />
        </StyledHeader>
    );
}

export default AppHeader;