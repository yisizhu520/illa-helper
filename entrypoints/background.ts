import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS } from '@/src/modules/types';

export default defineBackground(() => {
  // 在扩展首次安装时，设置默认值
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      try {
        // 使用StorageManager保存默认设置，确保使用序列化格式
        const { StorageManager } = await import('@/src/modules/storageManager');
        const storageManager = new StorageManager();
        await storageManager.saveUserSettings(DEFAULT_SETTINGS);
        console.log('DEFAULT_SETTINGS', DEFAULT_SETTINGS);
      } catch (error) {
        console.error('保存默认设置失败:', error);
        // 回退到旧的保存方式
        browser.storage.sync.set(DEFAULT_SETTINGS);
      }
    }
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'show-notification') {
      browser.notifications.create(message.options);
      return;
    }

    if (message.type === 'open-popup') {
      // 打开扩展的popup界面
      try {
        browser.action.openPopup();
      } catch (error) {
        console.error('无法打开popup:', error);
        const optionsUrl = browser.runtime.getURL('/options.html');
        browser.tabs.create({ url: optionsUrl });
      }
      return;
    }

    if (message.type === 'validate-configuration') {
      (async () => {
        try {
          // 使用StorageManager获取设置
          const { StorageManager } = await import(
            '@/src/modules/storageManager'
          );
          const storageManager = new StorageManager();
          const settings = await storageManager.getUserSettings();

          // 检查多配置系统中的活跃配置
          const activeConfig = settings.apiConfigs?.find(
            (config) => config.id === settings.activeApiConfigId,
          );
          const isConfigValid = !!activeConfig?.config?.apiKey;

          if (isConfigValid) {
            sendResponse(true);
            return;
          }
        } catch (error) {
          console.error('配置验证失败:', error);
          sendResponse(false);
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
      return true;
    }

    // 打开options页面
    if (message.type === 'open-options') {
      const optionsUrl = browser.runtime.getURL('/options.html');
      browser.tabs.create({ url: optionsUrl });
      return;
    }
  });
});
