<script lang="ts" setup>
import { ref, onMounted, watch, computed, reactive, nextTick } from 'vue';
import {
  TranslationStyle,
  TriggerMode,
  DEFAULT_SETTINGS,
  UserSettings,
  OriginalWordDisplayMode,
  DEFAULT_MULTILINGUAL_CONFIG,
  DEFAULT_TOOLTIP_HOTKEY,
  DEFAULT_FLOATING_BALL_CONFIG,
} from '@/src/modules/types';
import { getUserLevelOptions } from '@/src/utils';
import { StorageManager } from '@/src/modules/storageManager';
import { notifySettingsChanged } from '@/src/modules/messaging';
import {
  getTranslationDirectionOptions,
  getTargetLanguageOptions,
} from '@/src/modules/languageManager';

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });

onMounted(async () => {
  const storageManager = new StorageManager();
  const loadedSettings = await storageManager.getUserSettings();

  // 确保所有配置项存在
  if (!loadedSettings.multilingualConfig) {
    loadedSettings.multilingualConfig = { ...DEFAULT_MULTILINGUAL_CONFIG };
  }
  if (!loadedSettings.pronunciationHotkey) {
    loadedSettings.pronunciationHotkey = { ...DEFAULT_TOOLTIP_HOTKEY };
  }
  if (!loadedSettings.floatingBall) {
    loadedSettings.floatingBall = { ...DEFAULT_FLOATING_BALL_CONFIG };
  }

  // 设置settings.value后标记初始化完成
  settings.value = reactive(loadedSettings);

  // 延迟标记初始化完成，确保所有响应式更新都完成
  nextTick(() => {
    isInitializing = false;
  });
});

// 设置更新状态管理
let debounceTimer: number;
let isInitializing = true;

// 统一的设置更新监听
watch(
  settings,
  () => {
    // 跳过初始化阶段的触发
    if (isInitializing) return;

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(saveAndNotifySettings, 200);
  },
  { deep: true },
);

// 统一的保存和通知函数
const saveAndNotifySettings = async () => {
  try {
    if (
      settings.value.translationDirection === 'intelligent' &&
      !settings.value.multilingualConfig?.targetLanguage?.trim()
    ) {
      showSavedMessage('请选择目标语言后再保存设置');
      return;
    }

    const storageManager = new StorageManager();
    await storageManager.saveUserSettings(settings.value);
    await notifySettingsChanged(settings.value);
    showSavedMessage('设置已保存');
  } catch (error) {
    console.error('保存设置失败:', error);
    showSavedMessage('保存设置失败');
  }
};

const saveMessage = ref('');
const showSavedMessage = (message: string) => {
  saveMessage.value = message;
  setTimeout(() => (saveMessage.value = ''), 2000);
};

const manualTranslate = async () => {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, { type: 'MANUAL_TRANSLATE' });
    }
  } catch (error) {
    console.error('手动翻译失败:', error);
  }
};

const openAdvancedSettings = () => {
  console.error('browser.runtime', browser);
  const url = browser.runtime.getURL('/options.html');
  window.open(url);
};

const showApiSettings = ref(false);
const toggleApiSettings = () =>
  (showApiSettings.value = !showApiSettings.value);
const intelligentModeEnabled = computed(
  () => settings.value.translationDirection === 'intelligent',
);

watch(
  () => settings.value.translationDirection,
  (newDirection) => {
    if (isInitializing) return;

    if (newDirection === 'intelligent') {
      if (!settings.value.multilingualConfig) {
        settings.value.multilingualConfig = {
          intelligentMode: true,
          targetLanguage: '',
        };
      } else {
        settings.value.multilingualConfig.intelligentMode = true;
      }
    } else if (settings.value.multilingualConfig) {
      settings.value.multilingualConfig.intelligentMode = false;
    }
  },
);

const targetLanguageOptions = computed(() => getTargetLanguageOptions());
const directionOptions = computed(() => getTranslationDirectionOptions());

const onTargetLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (settings.value.multilingualConfig) {
    settings.value.multilingualConfig.targetLanguage = target.value;
  }
};

const levelOptions = getUserLevelOptions();

const styleOptions = [
  { value: TranslationStyle.DEFAULT, label: '默认' },
  { value: TranslationStyle.SUBTLE, label: '微妙' },
  { value: TranslationStyle.BOLD, label: '粗体' },
  { value: TranslationStyle.ITALIC, label: '斜体' },
  { value: TranslationStyle.UNDERLINED, label: '下划线' },
  { value: TranslationStyle.HIGHLIGHTED, label: '高亮' },
  { value: TranslationStyle.DOTTED, label: '点画线' },
  { value: TranslationStyle.LEARNING, label: '学习模式' },
];

const triggerOptions = [
  { value: TriggerMode.AUTOMATIC, label: '自动触发' },
  { value: TriggerMode.MANUAL, label: '手动触发' },
];

const originalWordDisplayOptions = [
  { value: OriginalWordDisplayMode.VISIBLE, label: '显示' },
  { value: OriginalWordDisplayMode.HIDDEN, label: '不显示' },
  { value: OriginalWordDisplayMode.LEARNING, label: '学习模式' },
];
</script>

<template>
  <div class="container">
    <header>
      <div class="header-content">
        <div class="logo">
          <img src="/assets/vue.svg" alt="logo" style="width: 24px; height: 24px" />
        </div>
        <div class="title-container">
          <h1>浸入式学语言助手</h1>
          <p>在浏览中轻松学外语</p>
        </div>
      </div>
      <button v-if="settings.triggerMode === 'manual'" @click="manualTranslate" class="manual-translate-btn" title="翻译">
        翻译
      </button>
    </header>

    <div class="settings">
      <div class="main-layout">
        <div class="settings-card">
          <div class="basic-settings-grid">
            <div class="setting-group">
              <label>翻译模式</label>
              <select v-model="settings.translationDirection">
                <option v-for="option in directionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div v-if="intelligentModeEnabled && settings.multilingualConfig" class="setting-group setting-box">
              <button @click="openAdvancedSettings" class="settings-btn" title="高级设置">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2583 9.77251 19.9887C9.5799 19.7191 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74165 9.96512 4.01127 9.77251C4.28089 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <label>目标语言</label>
              <select :value="settings.multilingualConfig.targetLanguage" @change="onTargetLanguageChange">
                <option value="" disabled>请选择目标语言</option>
                <optgroup label="常用语言">
                  <option v-for="option in targetLanguageOptions.filter(
                    (opt) => opt.isPopular,
                  )" :key="option.code" :value="option.code">
                    {{ option.nativeName }}
                  </option>
                </optgroup>
                <optgroup label="其他语言">
                  <option v-for="option in targetLanguageOptions.filter(
                    (opt) => !opt.isPopular,
                  )" :key="option.code" :value="option.code">
                    {{ option.nativeName }}
                  </option>
                </optgroup>
              </select>
            </div>

            <div class="setting-group">
              <label>语言水平</label>
              <select v-model="settings.userLevel">
                <option v-for="option in levelOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label>翻译样式</label>
              <select v-model="settings.translationStyle">
                <option v-for="option in styleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label>触发模式</label>
              <select v-model="settings.triggerMode">
                <option v-for="option in triggerOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label>原文显示</label>
              <select v-model="settings.originalWordDisplayMode">
                <option v-for="option in originalWordDisplayOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="topping-settings-card">
              <div class="setting-group">
                <label>悬浮框</label>
                <div class="toggle-container">
                  <input type="checkbox" v-model="settings.enablePronunciationTooltip" id="tooltip-toggle"
                    class="toggle-input" />
                  <label for="tooltip-toggle" class="toggle-label">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <!-- 快捷键设置 -->
              <div v-if="settings.enablePronunciationTooltip" class="setting-group">
                <label>Ctrl+鼠标悬停</label>
                <div class="toggle-container">
                  <input type="checkbox" v-model="settings.pronunciationHotkey.enabled" id="hotkey-enabled-toggle"
                    class="toggle-input" />
                  <label for="hotkey-enabled-toggle" class="toggle-label">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="topping-settings-card">
              <!-- 悬浮球设置 -->
              <div class="setting-group">
                <label>悬浮翻译球</label>
                <div class="toggle-container">
                  <input type="checkbox" v-model="settings.floatingBall.enabled" id="floating-ball-toggle"
                    class="toggle-input" />
                  <label for="floating-ball-toggle" class="toggle-label">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <!-- 悬浮球详细设置 -->
              <div v-if="settings.floatingBall.enabled" class="floating-ball-settings">
                <div class="setting-group">
                  <label>
                    透明度:
                    {{ Math.round(settings.floatingBall.opacity * 100) }}%
                  </label>
                  <input type="range" v-model.number="settings.floatingBall.opacity" min="0.3" max="1" step="0.1" />
                </div>
              </div>
            </div>

            <div class="setting-group full-width">
              <label>
                替换比例: {{ Math.round(settings.replacementRate * 100) }}%
              </label>
              <input type="range" v-model.number="settings.replacementRate" min="0.01" max="1" step="0.01" />
            </div>

            <div class="setting-group full-width">
              <label>段落最大长度: {{ settings.maxLength }}</label>
              <input type="range" v-model.number="settings.maxLength" min="10" max="2000" step="10" />
              <p class="setting-note" style="margin-top: 0">
                建议值: 80-100。较短的段落能更快获得AI响应。
              </p>
            </div>
          </div>
        </div>

        <div class="setting-group api-settings">
          <div class="api-header" @click="toggleApiSettings">
            <span>模型 API 设置</span>
            <svg class="toggle-icon" :class="{ 'is-open': showApiSettings }" width="16" height="16" viewBox="0 0 24 24"
              fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <div class="api-content" v-if="showApiSettings">
            <div>
              <div class="sub-setting-group">
                <label>API 端点</label>
                <input type="text" v-model="settings.apiConfig.apiEndpoint"
                  placeholder="例如: https://xxxxx/completions" />
              </div>
              <div class="sub-setting-group">
                <label>API 密钥</label>
                <input type="password" v-model="settings.apiConfig.apiKey" placeholder="输入您的 API 密钥" />
              </div>

              <div class="sub-setting-group">
                <label>模型</label>
                <input type="text" v-model.number="settings.apiConfig.model"
                  placeholder="例如: doubao-1-5-lite-32k-250115" />
              </div>
              <div class="sub-setting-group">
                <label>温度: {{ settings.apiConfig.temperature }}</label>
                <input type="range" v-model.number="settings.apiConfig.temperature" min="0" max="1" step="0.1" />
              </div>

              <p class="setting-note">
                注意: API 密钥仅保存在本地，不会发送到其他地方
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="save-message-container">
        <span class="save-message" v-if="saveMessage">{{ saveMessage }}</span>
      </div>
    </div>

    <footer>
      <p>💖 基于"i+1"理论，让学习自然发生</p>
    </footer>
  </div>
</template>

<style scoped>
:root {
  color-scheme: light dark;
}

.container {
  --bg-color: #f0f4f8;
  --card-bg-color: #ffffff;
  --primary-color: #6a88e0;
  --primary-hover-color: #5a78d0;
  --text-color: #37474f;
  --label-color: #546e7a;
  --border-color: #e0e6ed;
  --success-color: #4caf50;
  --input-bg-color: #fdfdff;
  --input-text-color: #37474f;
  --select-option-text-color: #000;
  --select-option-bg-color: #fff;

  width: 360px;
  padding: 10px;
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  position: relative;
}

@media (prefers-color-scheme: dark) {
  .container {
    --bg-color: #1e1e1e;
    --card-bg-color: #252526;
    --primary-color: #646cff;
    --primary-hover-color: #535bf2;
    --text-color: rgba(255, 255, 255, 0.87);
    --label-color: rgba(255, 255, 255, 0.7);
    --border-color: #3c3c3c;
    --input-bg-color: #3c3c3c;
    --input-text-color: rgba(255, 255, 255, 0.87);
    --select-option-text-color: #fff;
    --select-option-bg-color: #3c3c3c;
  }

  .toggle-slider {
    background-color: #f0f0f0 !important;
  }

  .toggle-label:hover {
    background-color: rgba(100, 108, 255, 0.2) !important;
  }

  .settings-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  }

  .settings-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  }
}

header {
  text-align: center;
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logo {
  flex-shrink: 0;
}

.title-container h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.title-container p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--label-color);
}

.setting-box {
  position: relative;
}

.settings-btn {
  position: absolute;
  top: -2px;
  right: 0;
  background: #e9655b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.settings-btn:hover {
  background: #df4444;
  transform: translateY(-1px);
}

.settings-btn:active {
  transform: translateY(0);
}

.manual-translate-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.manual-translate-btn:hover {
  background: var(--primary-hover-color);
}

.settings {
  margin-bottom: 16px;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-card {
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  box-sizing: border-box;
  width: 100%;
}

.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.basic-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.setting-group.full-width {
  grid-column: 1 / -1;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topping-settings-card {
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-container {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-label:hover {
  background-color: rgba(106, 136, 224, 0.2);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked+.toggle-label {
  background-color: var(--primary-color);
}

.toggle-input:checked+.toggle-label .toggle-slider {
  transform: translateX(20px);
  box-shadow: 0 2px 6px rgba(106, 136, 224, 0.4);
}

.toggle-input:focus+.toggle-label {
  box-shadow: 0 0 0 2px rgba(106, 136, 224, 0.3);
}

.setting-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--label-color);
}

.setting-group input,
.setting-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--input-bg-color);
  color: var(--input-text-color);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.setting-group input:focus,
.setting-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(106, 136, 224, 0.2);
}

.setting-group select option {
  color: var(--select-option-text-color);
  background-color: var(--select-option-bg-color);
}

.setting-group input[type='range'] {
  padding: 0;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  appearance: none;
  cursor: pointer;
}

.setting-group input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

.setting-group input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.setting-note {
  font-size: 12px;
  color: var(--label-color);
  margin: 4px 0 0 0;
  font-style: italic;
}

.api-settings {
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: var(--card-bg-color);
}

.api-header:hover {
  background: rgba(106, 136, 224, 0.05);
}

.api-header span {
  font-weight: 500;
  color: var(--text-color);
}

.toggle-icon {
  transition: transform 0.2s;
  color: var(--label-color);
}

.toggle-icon.is-open {
  transform: rotate(180deg);
}

.api-content {
  padding: 0 16px 16px 16px;
  border-top: 1px solid var(--border-color);
}

.sub-setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.sub-setting-group:last-of-type {
  margin-bottom: 0;
}

.sub-setting-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--label-color);
}

.save-message-container {
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.save-message {
  color: var(--success-color);
  font-size: 12px;
  font-weight: 500;
}

footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

footer p {
  margin: 0;
  font-size: 12px;
  color: var(--label-color);
}
</style>
