import { defineConfig } from 'wxt';
import removeConsole from 'vite-plugin-remove-console';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: '浸入式学语言助手',
    description:
      '基于"可理解输入"理论的英语学习工具，帮助你在日常浏览中自然学习英语',
    version: '1.0.1',
    permissions: ['storage', 'tabs', 'notifications'],
    host_permissions: ['<all_urls>'],
  },
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
  vite: (configEnv) => ({
    plugins:
      configEnv.mode === 'production'
        ? [removeConsole({ includes: ['log', 'warn'] })]
        : [],
  }),
});
