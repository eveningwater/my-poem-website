import React from 'react';
import StatisticsComponent from '../components/Statistics';

// dumi 2.x 全局组件
// 这个文件会被 dumi 自动识别并在所有页面渲染
export default function GlobalWrapper({ children }: { children: React.ReactNode }) {
  console.log('GlobalWrapper render');
  return (
    <>
      {children}
      <StatisticsComponent />
    </>
  );
}

