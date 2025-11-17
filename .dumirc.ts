import { defineConfig } from 'dumi';

const footerList = [
  {
    text: 'eveningwater(夕水)',
    url: 'https://www.eveningwater.com/',
  },
  {
    text: '联系我',
    url: 'mailto:854806732@qq.com',
  },
  {
    text: 'github',
    url: 'https://github.com/eveningwater',
  },
  {
    text: '码云',
    url: 'https://gitee.com/eveningwater',
  },
  {
    text: 'cn博客',
    url: 'https://www.cnblogs.com/eveningwater/',
  },
  {
    text: '个人博客',
    url: 'https://eveningwater.github.io/',
  },
  {
    text: '思否',
    url: 'https://segmentfault.com/u/xishui_5ac9a340a5484',
  },
  {
    text: '掘金',
    url: 'https://juejin.im/user/5bcfd79de51d45473245dc1c',
  },
  {
    text: '知乎',
    url: 'https://www.zhihu.com/people/eveningwater',
  },
  {
    text: '蜀ICP备17023218号',
    url: 'http://beian.miit.gov.cn/',
  },
];

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/my-poem-website/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/my-poem-website/' : '/',
  themeConfig: {
    name: 'poem',
    socialLinks: {
      github: 'https://github.com/eveningwater',
    },
    rtl: true,
    footer: `<span class="pipe-el">Copyright ©2023</span>
    ${footerList
      .map(
        (item) =>
          `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="pipe-el">${item.text}</a>`,
      )
      .join('')}`,
    editLink: `https://github.com/eveningwater/my-poem-website/tree/main/{filename}`,
    lastUpdated: true,
    nav: {
      'zh-CN': [
        {
          title: '小说',
          children: [
            {
              title: '长篇小说',
              link: 'https://www.eveningwater.com/novel-website/index.html',
            },
            { title: '小说设计', link: '/novel-design' },
            { title: '短篇小说', link: '/short-novel' },
          ],
        },
        {
          title: '诗',
          children: [
            { title: '旧体诗', link: '/old-style-poem' },
            { title: '现代诗', link: '/modern-poem' },
          ],
        },
        { title: '旧体词', link: '/old-style-word' },
        { title: '文言文', link: '/classical-chinese' },
        { title: '句', link: '/sentence' },
        { title: '元曲', link: '/yuan-opera' },
        { title: '歌曲', link: '/song' },
        { title: '对联', link: '/couplet' },
        { title: '格律检测', link: 'https://sou-yun.cn/analyzepoem.aspx' },
      ],
      'en-US': [
        {
          title: 'novel',
          children: [
            {
              title: 'long novel',
              link: 'https://www.eveningwater.com/novel-website/index.html',
            },
            { title: 'novel design', link: '/novel-design' },
            { title: 'short novel', link: '/short-novel' },
          ],
        },
        {
          title: 'poem',
          children: [
            { title: 'old style poem', link: '/old-style-poem' },
            { title: 'modern poem', link: '/modern-poem' },
          ],
        },
        { title: 'old style word', link: '/old-style-word' },
        { title: 'classical-chinese', link: '/classical-chinese' },
        { title: 'sentence', link: '/sentence' },
        { title: 'yuan-opera', link: '/yuan-opera' },
        { title: 'song', link: '/song' },
        { title: 'couplet', link: '/couplet' },
        { title: 'meter detection', link: 'https://sou-yun.cn/analyzepoem.aspx' },
      ],
    },
  },
  styles: [
    `
    .pipe-el+.pipe-el:before {
      content: "";
      font-size: 0;
      padding: 12px 3px 1px;
      margin-left: 6px;
      border-left: 1px solid #618fbd;
    }
    body {
      margin: 0;
    }
  `,
  ],
});
