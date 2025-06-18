import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS } from '@/src/modules/types';

export default defineBackground(() => {
  // 在扩展首次安装时，设置默认值
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      browser.storage.sync.set(DEFAULT_SETTINGS);
      console.log('默认设置已存储。');
    }
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'show-notification') {
      browser.notifications.create(message.options);
      return;
    }

    if (message.type === 'validate-configuration') {
      (async () => {
        const settings = await browser.storage.sync.get(null);
        const isConfigValid = !!settings?.apiConfig?.apiKey;

        if (isConfigValid) {
          sendResponse(true);
          return;
        }

        // --- 无效配置处理 ---
        const notificationOptions = {
          type: 'basic' as const,
          title: '[浸入式学语言助手] API 配置错误',
          message: 'API 密钥未设置。请点击扩展图标进入设置页面进行配置。',
          iconUrl: browser.runtime.getURL('/warning.png'),
        };

        if (message.source === 'user_action') {
          browser.notifications.create(notificationOptions);
        } else {
          // 默认为 page_load 逻辑
          const { apiKeyNotificationShown } = await browser.storage.session.get(
            'apiKeyNotificationShown',
          );
          if (!apiKeyNotificationShown) {
            browser.notifications.create(notificationOptions);
            await browser.storage.session.set({
              apiKeyNotificationShown: true,
            });
          }
        }
        sendResponse(false);
      })();

      return true; // 关键：表示我们将异步发送响应
    }
  });
});
