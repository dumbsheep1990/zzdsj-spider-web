import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb, Typography, Space } from 'antd';
import styled from 'styled-components';
import {
    HomeOutlined,
    PlayCircleOutlined,
    FileSearchOutlined,
    SettingOutlined,
    CloudDownloadOutlined,
    LinkOutlined,
    BulbOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { Title } = Typography;

// 样式化组件
const BreadcrumbContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PageTitle = styled(Title)`
  margin: 0 !important;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  .ant-breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

function AppBreadcrumb() {
    const location = useLocation();

    // 根据当前路径生成面包屑项
    const breadcrumbItems = useMemo(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);

        // 首页项
        const items = [
            {
                title: (
                    <Space>
                        <HomeOutlined />
                        首页
                    </Space>
                ),
                path: '/'
            }
        ];

        // 根据路径生成面包屑
        if (pathParts.length > 0) {
            if (pathParts[0] === 'crawler') {
                items.push({
                    title: (
                        <Space>
                            <PlayCircleOutlined />
                            爬虫控制
                        </Space>
                    ),
                    path: '/crawler'
                });
            } else if (pathParts[0] === 'articles') {
                items.push({
                    title: (
                        <Space>
                            <FileSearchOutlined />
                            文章管理
                        </Space>
                    ),
                    path: '/articles'
                });
            } else if (pathParts[0] === 'article') {
                items.push({
                    title: (
                        <Space>
                            <FileSearchOutlined />
                            文章管理
                        </Space>
                    ),
                    path: '/articles'
                });
                items.push({
                    title: (
                        <Space>
                            <FileTextOutlined />
                            文章详情
                        </Space>
                    ),
                    path: `/article/${pathParts[1]}`
                });
            } else if (pathParts[0] === 'cleaning') {
                items.push({
                    title: (
                        <Space>
                            <SettingOutlined />
                            数据清洗
                        </Space>
                    ),
                    path: '/cleaning'
                });
            } else if (pathParts[0] === 'export') {
                items.push({
                    title: (
                        <Space>
                            <CloudDownloadOutlined />
                            数据导出
                        </Space>
                    ),
                    path: '/export'
                });
            } else if (pathParts[0] === 'custom-crawl') {
                items.push({
                    title: (
                        <Space>
                            <LinkOutlined />
                            单页爬取
                        </Space>
                    ),
                    path: '/custom-crawl'
                });

                if (pathParts.length > 1) {
                    items.push({
                        title: (
                            <Space>
                                <FileTextOutlined />
                                爬取结果
                            </Space>
                        ),
                        path: `/custom-crawl/${pathParts[1]}`
                    });
                }
            } else if (pathParts[0] === 'ai-extract') {
                items.push({
                    title: (
                        <Space>
                            <BulbOutlined />
                            AI内容提取
                        </Space>
                    ),
                    path: '/ai-extract'
                });
            }
        }

        return items;
    }, [location.pathname]);

    return (
        <BreadcrumbContainer>
            <StyledBreadcrumb items={breadcrumbItems.map(item => ({
                title: item.title
            }))} />
        </BreadcrumbContainer>
    );
}

export default AppBreadcrumb;