import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Space, Table } from 'antd';
import { DatabaseOutlined, SettingOutlined } from '@ant-design/icons';

const { Option } = Select;

const Vectorization = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [setVectorizationSettings] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // TODO: 调用后端API进行向量化设置
            message.success('向量化设置已保存');
            setVectorizationSettings(values);
        } catch (error) {
            message.error('保存失败：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '字段名称',
            dataIndex: 'fieldName',
            key: 'fieldName',
        },
        {
            title: '向量化模型',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: '维度',
            dataIndex: 'dimension',
            key: 'dimension',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
        },
    ];

    return (
        <div>
            <Card
                title={
                    <span>
                        <DatabaseOutlined style={{ marginRight: 8 }} />
                        数据向量化设置
                    </span>
                }
                style={{ marginBottom: 24 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        model: 'text-embedding-ada-002',
                        dimension: 1536,
                    }}
                >
                    <Form.Item
                        label="向量化模型"
                        name="model"
                        rules={[{ required: true, message: '请选择向量化模型' }]}
                    >
                        <Select>
                            <Option value="text-embedding-ada-002">OpenAI Ada-002</Option>
                            <Option value="text-embedding-3-small">OpenAI 3-Small</Option>
                            <Option value="text-embedding-3-large">OpenAI 3-Large</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="向量维度"
                        name="dimension"
                        rules={[{ required: true, message: '请输入向量维度' }]}
                    >
                        <Input type="number" disabled />
                    </Form.Item>

                    <Form.Item
                        label="API密钥"
                        name="apiKey"
                        rules={[{ required: true, message: '请输入API密钥' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                保存设置
                            </Button>
                            <Button>测试连接</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title={
                    <span>
                        <SettingOutlined style={{ marginRight: 8 }} />
                        字段向量化配置
                    </span>
                }
            >
                <Table
                    columns={columns}
                    dataSource={[
                        {
                            key: '1',
                            fieldName: 'title',
                            model: 'text-embedding-ada-002',
                            dimension: 1536,
                            status: '已启用',
                        },
                        {
                            key: '2',
                            fieldName: 'content',
                            model: 'text-embedding-ada-002',
                            dimension: 1536,
                            status: '已启用',
                        },
                    ]}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default Vectorization; 