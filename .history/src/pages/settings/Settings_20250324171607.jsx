import React from 'react';
import { Tabs, Typography } from 'antd';
import LLMSettings from '../../components/settings/LLMSettings';
import VectorSettings from '../../components/settings/VectorSettings';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function Settings() {
    return (
        <div className="settings">
            <Title level={4}>系统设置</Title>
            <Paragraph>
                配置系统参数，包括LLM模型、向量化模型和向量数据库等设置。
            </Paragraph>

            <Tabs defaultActiveKey="1">
                <TabPane tab="LLM设置" key="1">
                    <LLMSettings />
                </TabPane>
                <TabPane tab="向量化设置" key="2">
                    <VectorSettings />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default Settings; 