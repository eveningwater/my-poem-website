import React, { useState, useEffect } from 'react';
import './index.css';

interface Statistics {
  [key: string]: number;
  total: number;
}

const StatisticsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('StatisticsComponent rendered');
  
  useEffect(() => {
    // 在客户端加载统计数据
    if (typeof window !== 'undefined') {
      loadStatistics();
    }
  }, []);

  const loadStatistics = async () => {
    try {
      // 从 public 目录加载预生成的统计数据
      // 获取当前页面的 base path
      const getBasePath = () => {
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (pathname.startsWith('/my-poem-website/')) {
            return '/my-poem-website/';
          }
        }
        return '/';
      };
      
      const basePath = getBasePath();
      const response = await fetch(`${basePath}statistics.json?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // 如果文件不存在，使用默认值
        setStats({
          total: 0,
          旧体诗: 0,
          旧体词: 0,
          现代诗: 0,
          歌曲: 0,
          对联: 0,
          元曲: 0,
          文言文: 0,
          短篇小说: 0,
          句: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setStats({
        total: 0,
        旧体诗: 0,
        旧体词: 0,
        现代诗: 0,
        歌曲: 0,
        对联: 0,
        元曲: 0,
        文言文: 0,
        短篇小说: 0,
        句: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // 由于在浏览器环境无法直接读取文件系统，我们需要在构建时生成统计数据
  // 这里先创建一个可以接收 props 的版本
  return (
    <>
      <div className="statistics-trigger" onClick={() => setIsOpen(!isOpen)}>
        📊
      </div>
      {isOpen && (
        <div className="statistics-overlay" onClick={() => setIsOpen(false)}>
          <div className="statistics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="statistics-header">
              <h2>作品统计</h2>
              <button className="statistics-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>
            <div className="statistics-content">
              {loading ? (
                <div className="statistics-loading">加载中...</div>
              ) : stats ? (
                <>
                  <div className="statistics-total">
                    <span className="statistics-label">总计：</span>
                    <span className="statistics-value">{stats.total}</span>
                  </div>
                  <div className="statistics-list">
                    {Object.entries(stats)
                      .filter(([key]) => key !== 'total')
                      .map(([type, count]) => (
                        <div key={type} className="statistics-item">
                          <span className="statistics-type">{type}：</span>
                          <span className="statistics-count">{count}</span>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="statistics-error">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatisticsComponent;
// 同时导出为 Statistics 以便在 markdown 中使用
export { StatisticsComponent };

