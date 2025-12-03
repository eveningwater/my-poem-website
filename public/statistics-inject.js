// 全局注入统计组件的脚本
(function() {
  if (typeof window === 'undefined' || window.__STATISTICS_INJECTED__) {
    return;
  }
  window.__STATISTICS_INJECTED__ = true;

  // 等待 React 和组件加载完成
  function injectStatistics() {
    // 这个脚本会在构建时被替换为实际的 React 组件代码
    // 或者通过动态导入的方式加载组件
    const container = document.createElement('div');
    container.id = 'statistics-root';
    document.body.appendChild(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStatistics);
  } else {
    injectStatistics();
  }
})();

