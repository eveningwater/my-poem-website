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
    if (typeof window === 'undefined') return;

    const copyText = async (text: string) => {
      // Prefer the modern clipboard API.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }

      // Fallback for older browsers.
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    };

    const collectPoemTextFromHeading = (heading: HTMLElement) => {
      const title = (heading.dataset.poemTitle || heading.innerText || '')
        .replace(/\s*复制\s*$/, '')
        .trim();

      const blocks: string[] = [];
      let node = heading.nextElementSibling as HTMLElement | null;
      while (node && node.tagName.toLowerCase() !== 'h2') {
        const text = (node.innerText || '').trim();
        if (text) blocks.push(text);
        node = node.nextElementSibling as HTMLElement | null;
      }

      return blocks.length ? `${title}\n\n${blocks.join('\n\n')}` : title;
    };

    const ensureImagePreviewRoot = () => {
      const existing = document.querySelector(
        '.poem-img-preview-overlay',
      ) as HTMLElement | null;
      if (existing) return existing;

      const overlay = document.createElement('div');
      overlay.className = 'poem-img-preview-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      const modal = document.createElement('div');
      modal.className = 'poem-img-preview-modal';
      modal.addEventListener('click', (e) => e.stopPropagation());

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'poem-img-preview-close';
      closeBtn.textContent = '×';

      const link = document.createElement('a');
      link.className = 'poem-img-preview-open';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '查看原图';

      const img = document.createElement('img');
      img.className = 'poem-img-preview-img';
      img.alt = '';

      const header = document.createElement('div');
      header.className = 'poem-img-preview-header';
      header.appendChild(link);
      header.appendChild(closeBtn);

      modal.appendChild(header);
      modal.appendChild(img);
      overlay.appendChild(modal);

      const close = () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('poem-img-preview-lock');
      };

      overlay.addEventListener('click', close);
      closeBtn.addEventListener('click', close);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
      };
      window.addEventListener('keydown', onKeyDown);

      document.body.appendChild(overlay);

      (overlay as any).__poemClose = close;
      (overlay as any).__poemImg = img;
      (overlay as any).__poemLink = link;
      return overlay;
    };

    const openImagePreview = (src: string, alt: string) => {
      const overlay = ensureImagePreviewRoot();
      const img = (overlay as any).__poemImg as HTMLImageElement;
      const link = (overlay as any).__poemLink as HTMLAnchorElement;

      img.src = src;
      img.alt = alt || '';
      link.href = src;

      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('poem-img-preview-lock');
    };

    const injectCopyButtons = () => {
      const root =
        (document.querySelector('.dumi-default-content') as HTMLElement | null) ||
        (document.querySelector('.markdown') as HTMLElement | null) ||
        (document.querySelector('article') as HTMLElement | null) ||
        (document.querySelector('main') as HTMLElement | null) ||
        document.body;

      const headings = Array.from(root.querySelectorAll('h2')) as HTMLElement[];
      headings.forEach((heading) => {
        if (heading.dataset.poemCopyInjected === '1') return;
        if (heading.closest('aside, nav, header, footer')) return;

        const titleText = (heading.innerText || '').trim();
        if (!titleText) return;

        heading.dataset.poemTitle = titleText;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'poem-copy-btn';
        button.textContent = '复制';

        button.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();

          const originalText = button.textContent;
          button.disabled = true;

          try {
            const textToCopy = collectPoemTextFromHeading(heading);
            await copyText(textToCopy);
            button.textContent = '已复制';
            window.setTimeout(() => {
              button.textContent = originalText || '复制';
              button.disabled = false;
            }, 1200);
          } catch (error) {
            console.error('Failed to copy poem:', error);
            button.textContent = '复制失败';
            window.setTimeout(() => {
              button.textContent = originalText || '复制';
              button.disabled = false;
            }, 1200);
          }
        });

        heading.appendChild(button);
        heading.dataset.poemCopyInjected = '1';
      });
    };

    const injectImageThumbs = () => {
      const root =
        (document.querySelector('.dumi-default-content') as HTMLElement | null) ||
        (document.querySelector('.markdown') as HTMLElement | null) ||
        (document.querySelector('article') as HTMLElement | null) ||
        (document.querySelector('main') as HTMLElement | null) ||
        document.body;

      const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
      images.forEach((img) => {
        if (img.dataset.poemThumbInjected === '1') return;
        if (img.closest('aside, nav, header, footer')) return;
        if (!img.getAttribute('src')) return;

        img.classList.add('poem-img-thumb');
        img.decoding = 'async';
        if (!img.loading) img.loading = 'lazy';
        img.tabIndex = img.tabIndex >= 0 ? img.tabIndex : 0;

        const open = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          const src = img.currentSrc || img.src;
          openImagePreview(src, img.alt || '');
        };

        img.addEventListener('click', open);
        img.addEventListener('keydown', (e) => {
          const key = (e as KeyboardEvent).key;
          if (key === 'Enter' || key === ' ') open(e);
        });

        img.dataset.poemThumbInjected = '1';
      });
    };

    const scheduleEnhance = (() => {
      let rafId = 0;
      return () => {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => {
          injectCopyButtons();
          injectImageThumbs();
        });
      };
    })();

    scheduleEnhance();

    const observeRoot =
      (document.querySelector('.dumi-default-content') as HTMLElement | null) ||
      (document.querySelector('.markdown') as HTMLElement | null) ||
      (document.querySelector('article') as HTMLElement | null) ||
      (document.querySelector('main') as HTMLElement | null) ||
      document.body;

    const observer = new MutationObserver(() => scheduleEnhance());
    observer.observe(observeRoot, { childList: true, subtree: true });
    window.addEventListener('hashchange', scheduleEnhance);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', scheduleEnhance);
    };
  }, []);

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
          散文: 0,
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
        散文: 0,
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
