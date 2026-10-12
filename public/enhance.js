/**
 * 全局增强脚本：复制按钮、图片点击预览、作品统计弹窗。
 * 通过 .dumirc.ts 的 headScripts/links 注入，对所有页面生效。
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  var DEFAULT_STATS = {
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
  };

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(textarea);
    });
  }

  function getContentRoot() {
    return (
      document.querySelector('.dumi-default-content') ||
      document.querySelector('.markdown') ||
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.body
    );
  }

  // 从标题元素开始收集文本，直到下一个同级标题
  function collectTextFromHeading(heading, stopTag) {
    var title = (heading.dataset.poemTitle || heading.innerText || '')
      .replace(/\s*复制\s*$/, '')
      .trim();

    var blocks = [];
    var node = heading.nextElementSibling;
    while (node && node.tagName.toLowerCase() !== stopTag) {
      var text = (node.innerText || '').trim();
      if (text) blocks.push(text);
      node = node.nextElementSibling;
    }

    return blocks.length ? title + '\n\n' + blocks.join('\n\n') : title;
  }

  // ===== 图片预览 =====
  function ensureImagePreviewRoot() {
    var existing = document.querySelector('.poem-img-preview-overlay');
    if (existing) return existing;

    var overlay = document.createElement('div');
    overlay.className = 'poem-img-preview-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var modal = document.createElement('div');
    modal.className = 'poem-img-preview-modal';
    modal.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'poem-img-preview-close';
    closeBtn.textContent = '×';

    var link = document.createElement('a');
    link.className = 'poem-img-preview-open';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '查看原图';

    var img = document.createElement('img');
    img.className = 'poem-img-preview-img';
    img.alt = '';

    var header = document.createElement('div');
    header.className = 'poem-img-preview-header';
    header.appendChild(link);
    header.appendChild(closeBtn);

    modal.appendChild(header);
    modal.appendChild(img);
    overlay.appendChild(modal);

    var close = function () {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('poem-img-preview-lock');
    };

    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    document.body.appendChild(overlay);

    overlay.__poemImg = img;
    overlay.__poemLink = link;
    return overlay;
  }

  function openImagePreview(src, alt) {
    var overlay = ensureImagePreviewRoot();
    var img = overlay.__poemImg;
    var link = overlay.__poemLink;

    img.src = src;
    img.alt = alt || '';
    link.href = src;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('poem-img-preview-lock');
  }

  // ===== 复制按钮 =====
  function injectCopyButtons(root) {
    // 多条目页面（对联、句等）有 h2 -> 每个 h2 加按钮；
    // 诗歌详情页没有 h2 -> 按钮挂到 h1
    var headings = Array.prototype.slice.call(root.querySelectorAll('h2'));
    var stopTag = 'h2';
    if (headings.length === 0) {
      headings = Array.prototype.slice.call(root.querySelectorAll('h1'));
      stopTag = 'h1';
    }

    headings.forEach(function (heading) {
      if (heading.dataset.poemCopyInjected === '1') return;
      if (heading.closest('aside, nav, header, footer')) return;

      var titleText = (heading.innerText || '').trim();
      if (!titleText) return;

      heading.dataset.poemTitle = titleText;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'poem-copy-btn';
      button.textContent = '复制';

      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var originalText = button.textContent;
        button.disabled = true;

        copyText(collectTextFromHeading(heading, stopTag))
          .then(function () {
            button.textContent = '已复制';
          })
          .catch(function (err) {
            console.error('Failed to copy poem:', err);
            button.textContent = '复制失败';
          })
          .finally(function () {
            window.setTimeout(function () {
              button.textContent = originalText || '复制';
              button.disabled = false;
            }, 1200);
          });
      });

      heading.appendChild(button);
      heading.dataset.poemCopyInjected = '1';
    });
  }

  function injectImageThumbs(root) {
    var images = Array.prototype.slice.call(root.querySelectorAll('img'));

    images.forEach(function (img) {
      if (img.dataset.poemThumbInjected === '1') return;
      if (img.closest('aside, nav, header, footer')) return;
      if (!img.getAttribute('src')) return;

      img.classList.add('poem-img-thumb');
      img.decoding = 'async';
      if (!img.loading) img.loading = 'lazy';
      img.tabIndex = img.tabIndex >= 0 ? img.tabIndex : 0;

      var open = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openImagePreview(img.currentSrc || img.src, img.alt || '');
      };

      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') open(e);
      });

      img.dataset.poemThumbInjected = '1';
    });
  }

  // ===== 作品统计弹窗 =====
  function getBasePath() {
    return window.location.pathname.indexOf('my-poem-website') !== -1
      ? '/my-poem-website/'
      : '/';
  }

  function createStatisticsWidget() {
    if (document.querySelector('.statistics-trigger')) return;

    var trigger = document.createElement('div');
    trigger.className = 'statistics-trigger';
    trigger.innerHTML =
      '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
      '<path d="M1024.25175 0l-209.92 23.04L883.45175 92.16 655.61175 370.688 419.06775 152.064c-15.872-14.848-40.96-14.848-57.344-0.512L14.07575 465.408C-3.33225 481.28-4.86825 508.416 11.00375 525.824c8.192 9.216 19.968 13.824 31.744 13.824 10.24 0 20.48-3.584 28.672-10.752l318.464-287.744 241.152 222.72c8.704 8.192 20.48 11.776 31.744 11.264 11.776-1.024 22.528-6.656 30.208-15.36l250.88-306.688 57.344 57.344L1024.25175 0z m0 0M133.37175 1024H30.97175c-16.896 0-30.72-13.824-30.72-30.72v-348.16c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v348.16c0 16.896-13.824 30.72-30.72 30.72z" fill="#fff"></path>' +
      '<path d="M420.09175 1024H317.69175c-16.896 0-30.72-13.824-30.72-30.72V440.32c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v552.96c0 16.896-13.824 30.72-30.72 30.72zM706.81175 1024h-102.4c-16.896 0-30.72-13.824-30.72-30.72v-399.36c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v399.36c0 16.896-13.824 30.72-30.72 30.72zM993.53175 1024h-102.4c-16.896 0-30.72-13.824-30.72-30.72V337.92c0-16.896 13.824-30.72 30.72-30.72h102.4c16.896 0 30.72 13.824 30.72 30.72v655.36c0 16.896-13.824 30.72-30.72 30.72z" fill="#fff"></path>' +
      '</svg>';
    document.body.appendChild(trigger);

    var overlay = null;

    function renderStats(stats, loading) {
      if (loading) {
        return '<div class="statistics-loading">加载中...</div>';
      }
      if (!stats) {
        return '<div class="statistics-error">暂无数据</div>';
      }
      var html =
        '<div class="statistics-total">' +
        '<span class="statistics-label">总计：</span>' +
        '<span class="statistics-value">' +
        stats.total +
        '</span></div><div class="statistics-list">';
      Object.keys(stats).forEach(function (key) {
        if (key === 'total') return;
        html +=
          '<div class="statistics-item">' +
          '<span class="statistics-type">' +
          key +
          '：</span>' +
          '<span class="statistics-count">' +
          stats[key] +
          '</span></div>';
      });
      html += '</div>';
      return html;
    }

    function openModal() {
      if (overlay) {
        overlay.remove();
        overlay = null;
        return;
      }

      overlay = document.createElement('div');
      overlay.className = 'statistics-overlay';

      var modal = document.createElement('div');
      modal.className = 'statistics-modal';
      modal.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      modal.innerHTML =
        '<div class="statistics-header"><h2>作品统计</h2>' +
        '<button class="statistics-close">×</button></div>' +
        '<div class="statistics-content">' +
        renderStats(null, true) +
        '</div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function () {
        overlay.remove();
        overlay = null;
      });
      modal.querySelector('.statistics-close').addEventListener('click', function () {
        overlay.remove();
        overlay = null;
      });

      fetch(getBasePath() + 'statistics.json?t=' + Date.now())
        .then(function (res) {
          return res.ok ? res.json() : DEFAULT_STATS;
        })
        .catch(function () {
          return DEFAULT_STATS;
        })
        .then(function (stats) {
          if (overlay) {
            overlay.querySelector('.statistics-content').innerHTML = renderStats(stats, false);
          }
        });
    }

    trigger.addEventListener('click', openModal);
  }

  // ===== 调度 =====
  var rafId = 0;
  function scheduleEnhance() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(function () {
      var root = getContentRoot();
      injectCopyButtons(root);
      injectImageThumbs(root);
      createStatisticsWidget();
    });
  }

  function init() {
    scheduleEnhance();

    var observeRoot = getContentRoot();
    var observer = new MutationObserver(function () {
      scheduleEnhance();
    });
    observer.observe(observeRoot, { childList: true, subtree: true });
    window.addEventListener('hashchange', scheduleEnhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
