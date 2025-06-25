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

  try {
    const manifest = browser.runtime.getManifest();
    extensionVersion.value = manifest.version;
  } catch (error) {
    console.error("无法获取扩展版本号:", error);
    // 在非扩展环境或开发服务器中，这可能会失败。可以设置一个默认值。
    extensionVersion.value = 'DEV';
  }
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
const extensionVersion = ref('N/A');

</script>

<template>
  <div class="container">
    <header>
      <div class="header-content">
        <div class="logo">
          <img src="/assets/vue.svg" alt="logo" style="width: 40px; height: 40px" />
        </div>
        <div class="title-container">
          <h1>浸入式学语言助手</h1>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="settings.triggerMode === 'manual'" @click="manualTranslate" class="manual-translate-btn"
          title="翻译">
          翻译
        </button>
      </div>
    </header>

    <div class="settings">
      <div class="main-layout">
        <div class="settings-card">
          <div class="adaptive-settings-grid">
            <div class="setting-group">
              <label>翻译模式</label>
              <select v-model="settings.translationDirection">
                <option v-for="option in directionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <Transition name="slide-down" mode="out-in">
              <div v-if="intelligentModeEnabled && settings.multilingualConfig"
                class="setting-group target-language-group">
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
            </Transition>

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

            <div class="setting-group full-width">
              <label>
                替换比例: {{ Math.round(settings.replacementRate * 100) }}%
              </label>
              <input type="range" v-model.number="settings.replacementRate" min="0.01" max="1" step="0.01" />
            </div>

            <div class="setting-group full-width">
              <label>段落最大长度: {{ settings.maxLength }}</label>
              <input type="range" v-model.number="settings.maxLength" min="10" max="2000" step="10" />
              <p class="setting-note" style="margin-top: 2px">
                段落越短AI响应越快。
              </p>
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
                <input type="checkbox" v-model="settings.pronunciationHotkey.enabled" id="hotkey-enabled-toggle"
                  class="toggle-input" />
                <label for="hotkey-enabled-toggle" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
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
              <div v-if="settings.floatingBall.enabled">
                <div class="setting-group">
                  <label>
                    透明度:
                    {{ Math.round(settings.floatingBall.opacity * 100) }}%
                  </label>
                  <input type="range" v-model.number="settings.floatingBall.opacity" min="0.1" max="1" step="0.05" />
                </div>
              </div>
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
                  placeholder="例如: https://xxxxx/v1/chat/completions" />
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
      <div class="footer-row floating-footer">
        <div class="footer-row-left flex flex-col items-center">
          <p>💖 基于"i+1"理论，让学习自然发生<span class="text-gray-500 ml-2">v{{ extensionVersion }}</span> </p>
        </div>
        <button class="footer-settings-btn" @click="openAdvancedSettings" title="设置中心">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2" />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="currentColor" stroke-width="2" />
          </svg>
          <span class="footer-settings-text">设置</span>
        </button>
      </div>
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
  padding-bottom: 56px;
  /* 预留footer高度，避免内容被遮挡 */
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
  font-size: 16px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-btn {
  background: var(--border-color);
  color: var(--label-color);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s,
    color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.settings-btn:hover {
  background: var(--primary-color);
  color: white;
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

.advanced-settings-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.advanced-settings-btn:hover {
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

.adaptive-settings-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.adaptive-settings-grid .setting-group {
  flex: 1 1 calc(50% - 6px);
  min-width: 140px;
}

.adaptive-settings-grid .setting-group.target-language-group {
  flex: 1 1 calc(50% - 6px);
  min-width: 140px;
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
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
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



footer p {
  margin: 0;
  font-size: 12px;
  color: var(--label-color);
}

/* 目标语言选择器动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.footer-settings-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--border-color);
  color: var(--label-color);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.footer-settings-btn:hover {
  background: var(--primary-color);
  color: #fff;
}

.footer-settings-text {
  margin-left: 2px;
}

.floating-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: rgba(240, 244, 248, 0.85);
  border-top: 1px solid var(--border-color);
  z-index: 100;
  box-sizing: border-box;
  padding: 14px 14px 10px 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  overflow: visible;
}

.floating-footer::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  width: 100%;
  height: 16px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(240, 244, 248, 0.7) 0%, rgba(240, 244, 248, 0) 100%);
  border-radius: 8px 8px 0 0;
  z-index: -1;
}

@media (prefers-color-scheme: dark) {
  .floating-footer {
    background: rgba(30, 30, 30, 0.85);
    border-top: 1px solid #333;
    box-shadow: 0 -2px 24px rgba(0, 0, 0, 0.18);
  }

  .floating-footer::before {
    background: linear-gradient(to bottom, rgba(30, 30, 30, 0.7) 0%, rgba(30, 30, 30, 0) 100%);
  }
}
</style>
