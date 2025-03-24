import styled from 'styled-components';
import { Card } from 'antd';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background: #fff;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 24px;
  }
`;

export default StyledCard; 