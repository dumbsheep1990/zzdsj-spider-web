import React from 'react';
import { Modal, List, Tag, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

const StatusItem = styled(List.Item)`
  padding: 12px 24px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
  }
`;

const StatusIcon = styled.span`
  margin-right: 12px;
  font-size: 16px;
`;

const StatusText = styled(Text)`
  font-size: 14px;
`;

function APIStatusModal({ visible, onCancel, apiStatus }) {
    const getStatusIcon = (status) => {
        switch(status) {
            case 'connected':
                return <CheckCircleFilled style={{ color: '#52c41a' }} />;
            case 'disconnected':
                return <CloseCircleFilled style={{ color: '#f5222d' }} />;
            default:
                return <QuestionCircleFilled style={{ color: '#faad14' }} />;
        }
    };

    const getStatusTag = (status) => {
        switch(status) {
            case 'connected':
                return <Tag color="success">已连接</Tag>;
            case 'disconnected':
                return <Tag color="error">未连接</Tag>;
            default:
                return <Tag color="warning">未知</Tag>;
        }
    };

    const getStatusDescription = (status) => {
        switch(status) {
            case 'connected':
                return '服务正常运行中';
            case 'disconnected':
                return '服务连接失败，请检查网络或服务状态';
            default:
                return '无法确定服务状态';
        }
    };

    return (
        <Modal
            title="API 连接状态"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <List
                dataSource={[
                    {
                        name: '系统服务',
                        status: apiStatus.system || 'unknown',
                        description: '系统核心服务状态'
                    }
                ]}
                renderItem={item => (
                    <StatusItem>
                        <List.Item.Meta
                            avatar={
                                <StatusIcon>
                                    {getStatusIcon(item.status)}
                                </StatusIcon>
                            }
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <StatusText>{item.name}</StatusText>
                                    {getStatusTag(item.status)}
                                </div>
                            }
                            description={getStatusDescription(item.status)}
                        />
                    </StatusItem>
                )}
            />
        </Modal>
    );
}

export default APIStatusModal;