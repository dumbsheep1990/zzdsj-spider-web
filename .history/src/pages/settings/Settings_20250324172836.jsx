import React from 'react';
import { Typography } from 'antd';
import LLMSettings from '../../components/settings/LLMSettings';

const { Title, Paragraph } = Typography;

function Settings() {
    return (
        <div className="settings">
            <Title level={4}>系统设置</Title>
            <Paragraph>
                配置系统参数，包括LLM模型、向量化模型和向量数据库等设置。
            </Paragraph>

            <LLMSettings />
        </div>
    );
}

export default Settings; 