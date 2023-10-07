import { defineConfig } from 'dumi';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/my-poem-website/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/my-poem-website/' : '/',
  themeConfig: {

  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'English' },
  ],
});
