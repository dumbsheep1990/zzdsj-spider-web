import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import CrawlerLogoIcon from './CrawlerLogoIcon';

const { Text } = Typography;

// 样式化组件
const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const LogoText = styled.div`
    display: flex;
    flex-direction: column;
`;

const AppName = styled(Text)`
    font-size: 18px;
    font-weight: bold;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    line-height: 1.2;
`;

const AppSubName = styled(Text)`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
`;

function AppLogo({ collapsed }) {
    // 当侧边栏收起时只显示图标
    if (collapsed) {
        return (
            <LogoContainer style={{ justifyContent: 'center', padding: '16px 0' }}>
                <CrawlerLogoIcon size={36} animate={true} />
            </LogoContainer>
        );
    }

    return (
        <LogoContainer>
            <CrawlerLogoIcon size={36} animate={true} />
            <LogoText>
                <AppName>智能爬虫系统</AppName>
                <AppSubName>Crawl4AI</AppSubName>
            </LogoText>
        </LogoContainer>
    );
}

export default AppLogo;