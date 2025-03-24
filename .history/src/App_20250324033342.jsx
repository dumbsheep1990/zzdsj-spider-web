import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import styled from 'styled-components';

// 全局设置上下文
import { useGlobalSettings } from './context/GlobalSettingsContext';

// 布局组件
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import AppBreadcrumb from './components/layout/AppBreadcrumb';

// 页面组件
import Dashboard from './pages/Dashboard';
import CrawlerControl from './pages/crawler/CrawlerControl';
import ArticlesList from './pages/articles/ArticlesList';
import ArticleDetail from './pages/articles/ArticleDetail';
import DataCleaning from './pages/cleaning/DataCleaning';
import DataExport from './pages/export/DataExport';
import CustomCrawl from './pages/crawler/CustomCrawl';
import CustomCrawlResult from './pages/crawler/CustomCrawlResult';
import AIExtract from './pages/ai/AIExtract';

const { Content } = Layout;

// 样式化组件
const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const ContentLayout = styled(Layout)`
  height: calc(100vh - 64px);
  overflow: auto;
  background: #f0f2f5;
`;

const MainContent = styled(Content)`
  margin: 16px;
  padding: 0;
  min-height: calc(100vh - 120px);
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 280px;
  margin-top: 16px;
  transition: all 0.3s ease;
  border-top: 4px solid;
  border-image: linear-gradient(90deg, #1890ff 0%, #722ed1 50%, #eb2f96 100%) 1;

  .ant-card {
    border-radius: 12px;
    transition: all 0.3s ease;
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    
    &:hover {
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.9);
    }

    .ant-card-head {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0) 100%);
      }
    }

    .ant-card-body {
      background: transparent;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

function AppContent() {
    const { checkAPIStatus } = useGlobalSettings();

    // 组件加载时检查API状态
    useEffect(() => {
        checkAPIStatus();
        // 每隔5分钟检查一次API状态
        const intervalId = setInterval(checkAPIStatus, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // 配置Ant Design主题
    const themeConfig = {
        token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            colorBgContainer: '#ffffff',
        },
        components: {
            Card: {
                borderRadiusLG: 12,
            },
            Table: {
                borderRadiusLG: 8,
            },
            Button: {
                borderRadius: 6,
            },
        },
    };

    return (
        <ConfigProvider theme={themeConfig} locale={zhCN}>
            <Router>
                <StyledLayout>
                    <AppHeader />
                    <Layout hasSider>
                        <AppSidebar />
                        <ContentLayout>
                            <MainContent>
                                <AppBreadcrumb />
                                <ContentCard>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/crawler" element={<CrawlerControl />} />
                                        <Route path="/articles" element={<ArticlesList />} />
                                        <Route path="/article/:id" element={<ArticleDetail />} />
                                        <Route path="/cleaning" element={<DataCleaning />} />
                                        <Route path="/export" element={<DataExport />} />
                                        <Route path="/custom-crawl" element={<CustomCrawl />} />
                                        <Route path="/custom-crawl/:id" element={<CustomCrawlResult />} />
                                        <Route path="/ai-extract" element={<AIExtract />} />
                                    </Routes>
                                </ContentCard>
                            </MainContent>
                        </ContentLayout>
                    </Layout>
                </StyledLayout>
            </Router>
        </ConfigProvider>
    );
}

// 主应用组件
function App() {
    return <AppContent />;
}

export default App;