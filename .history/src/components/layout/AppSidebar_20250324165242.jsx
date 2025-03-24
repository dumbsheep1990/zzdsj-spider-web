import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    PlayCircleOutlined,
    FileSearchOutlined,
    SettingOutlined,
    CloudDownloadOutlined,
    LinkOutlined,
    BulbOutlined,
    GlobalOutlined,
    DatabaseOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

// 样式化组件
const StyledSider = styled(Sider)`
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  left: 0;
  overflow: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
  
  .ant-menu-item {
    margin: 4px 0;
    border-radius: 0 8px 8px 0;
    
    &.ant-menu-item-selected {
      background: linear-gradient(90deg, #1677ff 0%, #1668dc 100%);
    }
  }
`;

function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const onCollapse = collapsed => {
        setCollapsed(collapsed);
    };

    // 获取当前激活的菜单项
    const getActiveKey = () => {
        const path = location.pathname;
        if (path === '/') return '1';
        if (path.startsWith('/crawler')) return '2';
        if (path.startsWith('/article')) return '3';
        if (path.startsWith('/cleaning')) return '4';
        if (path.startsWith('/export')) return '5';
        if (path.startsWith('/custom-crawl')) return '6';
        if (path.startsWith('/ai-extract')) return '7';
        if (path.startsWith('/vectorization')) return '8';
        return '1';
    };

    return (
        <StyledSider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            width={240}
            theme="dark"
        >
            <Menu
                theme="dark"
                defaultSelectedKeys={[getActiveKey()]}
                selectedKeys={[getActiveKey()]}
                mode="inline"
                onClick={({ key }) => {
                    if (key === '1') navigate('/');
                    else if (key === '2') navigate('/crawler');
                    else if (key === '3') navigate('/articles');
                    else if (key === '4') navigate('/cleaning');
                    else if (key === '5') navigate('/export');
                    else if (key === '6') navigate('/custom-crawl');
                    else if (key === '7') navigate('/ai-extract');
                    else if (key === '8') navigate('/vectorization');
                }}
            >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                    仪表盘
                </Menu.Item>
                <Menu.Item key="2" icon={<PlayCircleOutlined />}>
                    爬虫控制
                </Menu.Item>
                <Menu.Item key="3" icon={<FileSearchOutlined />}>
                    文章管理
                </Menu.Item>
                <Menu.Item key="4" icon={<SettingOutlined />}>
                    数据清洗
                </Menu.Item>
                <Menu.Item key="5" icon={<CloudDownloadOutlined />}>
                    数据导出
                </Menu.Item>
                <Menu.Item key="6" icon={<LinkOutlined />}>
                    单页爬取
                </Menu.Item>
                <Menu.Item key="7" icon={<BulbOutlined />}>
                    AI内容提取
                </Menu.Item>
                <Menu.Item key="8" icon={<DatabaseOutlined />}>
                    数据向量化
                </Menu.Item>
            </Menu>

            {/* 底部版本信息 */}
            {!collapsed && (
                <div style={{
                    margin: 'auto 0 0 0',
                    padding: '16px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px'
                }}>
                    <div>智政智能爬虫框架</div>
                    <div>v1.0.0</div>
                </div>
            )}
        </StyledSider>
    );
}

export default AppSidebar;