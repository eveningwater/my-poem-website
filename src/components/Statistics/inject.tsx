import React from 'react';
import ReactDOM from 'react-dom/client';
import StatisticsComponent from './index';
import './index.css';

// 在页面加载时自动注入统计组件
if (typeof window !== 'undefined') {
  // 等待 DOM 加载完成
  const injectComponent = () => {
    // 检查是否已经注入
    if (document.getElementById('statistics-root')) {
      return;
    }

    // 创建容器
    const container = document.createElement('div');
    container.id = 'statistics-root';
    document.body.appendChild(container);

    // 渲染组件
    const root = ReactDOM.createRoot(container);
    root.render(<StatisticsComponent />);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponent);
  } else {
    injectComponent();
  }
}

