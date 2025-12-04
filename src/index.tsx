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
        const pathname = window.location.pathname;
        console.log(pathname);
        if (pathname.includes('my-poem-website')) {
          return '/my-poem-website/';
        }
        return '/';
      };

      const basePath = getBasePath();
      const response = await fetch(
        `${basePath}statistics.json?t=${Date.now()}`,
      );
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
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4865"
          width="200"
          height="200"
        >
          <path
            d="M1024.25175 0l-209.92 23.04L883.45175 92.16 655.61175 370.688 419.06775 152.064c-15.872-14.848-40.96-14.848-57.344-0.512L14.07575 465.408C-3.33225 481.28-4.86825 508.416 11.00375 525.824c8.192 9.216 19.968 13.824 31.744 13.824 10.24 0 20.48-3.584 28.672-10.752l318.464-287.744 241.152 222.72c8.704 8.192 20.48 11.776 31.744 11.264 11.776-1.024 22.528-6.656 30.208-15.36l250.88-306.688 57.344 57.344L1024.25175 0z m0 0M133.37175 1024H30.97175c-16.896 0-30.72-13.824-30.72-30.72v-348.16c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v348.16c0 16.896-13.824 30.72-30.72 30.72z"
            p-id="4866"
            fill="#fff"
          ></path>
          <path
            d="M420.09175 1024H317.69175c-16.896 0-30.72-13.824-30.72-30.72V440.32c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v552.96c0 16.896-13.824 30.72-30.72 30.72zM706.81175 1024h-102.4c-16.896 0-30.72-13.824-30.72-30.72v-399.36c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v399.36c0 16.896-13.824 30.72-30.72 30.72zM993.53175 1024h-102.4c-16.896 0-30.72-13.824-30.72-30.72V337.92c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v655.36c0 16.896-13.824 30.72-30.72 30.72z"
            p-id="4867"
            fill="#fff"
          ></path>
        </svg>
      </div>
      {isOpen && (
        <div className="statistics-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="statistics-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="statistics-header">
              <h2>作品统计</h2>
              <button
                className="statistics-close"
                onClick={() => setIsOpen(false)}
              >
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
