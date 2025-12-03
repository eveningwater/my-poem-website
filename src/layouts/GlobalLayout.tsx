import React from 'react';
import StatisticsComponent from '../components/Statistics';

const GlobalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <StatisticsComponent />
    </>
  );
};

export default GlobalLayout;

