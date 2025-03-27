import React from 'react';
import styled from 'styled-components';

// 创建一个带动画效果的爬虫图标组件
const SvgContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || 40}px;
  height: ${props => props.size || 40}px;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  .crawler-icon-path {
    stroke-dasharray: 100;
    stroke-dashoffset: ${props => props.animate ? 100 : 0};
    animation: ${props => props.animate ? 'dash 2s ease-in-out infinite' : 'none'};
  }
  
  .crawler-icon-circle {
    transform-origin: center;
    animation: ${props => props.animate ? 'pulse 2s ease-in-out infinite' : 'none'};
  }
  
  .crawler-icon-web {
    stroke-opacity: ${props => props.animate ? 0.7 : 1};
    animation: ${props => props.animate ? 'fade 3s ease-in-out infinite' : 'none'};
  }
  
  @keyframes dash {
    from {
      stroke-dashoffset: 100;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes fade {
    0% {
      stroke-opacity: 0.3;
    }
    50% {
      stroke-opacity: 1;
    }
    100% {
      stroke-opacity: 0.3;
    }
  }
`;

function CrawlerLogoIcon({ size = 40, color = '#1677ff', animate = false }) {
    return (
        <SvgContainer size={size} animate={animate ? 'true' : 'false'}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 爬虫身体 */}
                <circle
                    className="crawler-icon-circle"
                    cx="50"
                    cy="50"
                    r="25"
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="3"
                />

                {/* 爬虫足 */}
                <path
                    className="crawler-icon-path"
                    d="M35 40 L25 30 M35 60 L25 70 M65 40 L75 30 M65 60 L75 70"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 爬虫触角 */}
                <path
                    className="crawler-icon-path"
                    d="M45 35 L40 20 M55 35 L60 20"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 眼睛 */}
                <circle cx="40" cy="45" r="5" fill="white" stroke={color} strokeWidth="2" />
                <circle cx="60" cy="45" r="5" fill="white" stroke={color} strokeWidth="2" />
                <circle cx="40" cy="45" r="2" fill={color} />
                <circle cx="60" cy="45" r="2" fill={color} />

                {/* 网络线条 */}
                <path
                    className="crawler-icon-web"
                    d="M10 10 L25 25 M90 10 L75 25 M10 90 L25 75 M90 90 L75 75"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.7"
                    strokeDasharray="2 4"
                />

                {/* 全球网络外圈 */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={color}
                    strokeWidth="2"
                    strokeOpacity="0.2"
                    strokeDasharray="2 6"
                />
            </svg>
        </SvgContainer>
    );
}

export default CrawlerLogoIcon;