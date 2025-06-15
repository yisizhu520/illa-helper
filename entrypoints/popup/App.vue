<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { UserLevel, TranslationStyle, TriggerMode, TranslationDirection, DEFAULT_SETTINGS, UserSettings } from '@/src/modules/types';
import { StorageManager } from '@/src/modules/storageManager';
import { notifySettingsChanged } from '@/src/modules/messaging';

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
console.log(settings.value)
onMounted(async () => {
  const storageManager = new StorageManager();
  settings.value = await storageManager.getUserSettings();
});

const saveSettings = async () => {
  const storageManager = new StorageManager();
  await storageManager.saveUserSettings(settings.value);
  await notifySettingsChanged(settings.value);
  showSavedMessage();
};

const saveMessage = ref('');
const showSavedMessage = () => {
  saveMessage.value = '设置已保存';
  setTimeout(() => {
    saveMessage.value = '';
  }, 2000);
};

const manualTranslate = async () => {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, { type: 'MANUAL_TRANSLATE' });
    }
  } catch (error) {
    console.error('手动翻译失败:', error);
  }
};

// UI Toggles
const showApiSettings = ref(false);
const toggleApiSettings = () => {
  showApiSettings.value = !showApiSettings.value;
};

const levelOptions = [
  { value: UserLevel.BEGINNER, label: '初级' },
  { value: UserLevel.ELEMENTARY, label: '基础' },
  { value: UserLevel.INTERMEDIATE, label: '中级' },
  { value: UserLevel.ADVANCED, label: '高级' },
  { value: UserLevel.PROFICIENT, label: '精通' }
];

const styleOptions = [
  { value: TranslationStyle.DEFAULT, label: '默认' },
  { value: TranslationStyle.UNDERLINED, label: '下划线' },
  { value: TranslationStyle.BOLD, label: '粗体' },
  { value: TranslationStyle.ITALIC, label: '斜体' },
  { value: TranslationStyle.HIGHLIGHTED, label: '高亮' },
  { value: TranslationStyle.SUBTLE, label: '微妙' }
];

const triggerOptions = [
  { value: TriggerMode.AUTOMATIC, label: '自动触发' },
  { value: TriggerMode.MANUAL, label: '手动触发' }
];

const directionOptions = [
  { value: TranslationDirection.AUTO, label: '自动检测网站语言' },
  { value: TranslationDirection.ZH_TO_EN, label: '中译英 (强制)' },
  { value: TranslationDirection.EN_TO_ZH, label: '英译中 (强制)' }
];
</script>

<template>
  <div class="container">
    <header>
      <div class="header-content">
        <div class="logo">
          <img src="/assets/vue.svg" alt="logo" style="width: 24px; height: 24px;" />
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
        <div class="basic-settings-grid">
          <div class="setting-group">
            <label>翻译方向</label>
            <select v-model="settings.translationDirection">
              <option v-for="option in directionOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="setting-group">
            <label>英语水平</label>
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
        </div>

        <div class="setting-group">
          <label>段落最大长度: {{ settings.maxLength }}</label>
          <input type="range" v-model.number="settings.maxLength" min="10" max="1000" step="10">
          <p class="setting-note">建议值: 80-800。较短的段落能更快获得AI响应。</p>
        </div>

        <div class="setting-group api-settings">
          <div class="api-header" @click="toggleApiSettings">
            <span>模型 API 设置</span>
            <svg class="toggle-icon" :class="{ 'is-open': showApiSettings }" width="16" height="16"
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <div class="api-content" v-if="showApiSettings">
            <div>
              <div class="sub-setting-group">
                <label>API 端点</label>
                <input type="text" v-model="settings.apiConfig.apiEndpoint" placeholder="例如: https://xxxxx/completions">
              </div>
              <div class="sub-setting-group">
                <label>API 密钥</label>
                <input type="password" v-model="settings.apiConfig.apiKey" placeholder="输入您的 API 密钥">
              </div>

              <div class="sub-setting-group">
                <label>模型</label>
                <input type="text" v-model="settings.apiConfig.model" placeholder="例如: gpt-3.5-turbo">
              </div>
              <div class="sub-setting-group">
                <label>温度: {{ settings.apiConfig.temperature }}</label>
                <input type="range" v-model="settings.apiConfig.temperature" min="0" max="1" step="0.1">
              </div>

              <p class="setting-note">注意: API 密钥仅保存在本地，不会发送到其他地方</p>
            </div>
          </div>
        </div>
      </div>
      <div class="button-container">
        <button @click="saveSettings">保存设置</button>
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
  color-scheme: light;
  --bg-color: #f0f4f8;
  --card-bg-color: #ffffff;
  --primary-color: #6a88e0;
  --primary-hover-color: #5a78d0;
  --accent-color: #ffafcc;
  --text-color: #37474f;
  --label-color: #546e7a;
  --border-color: #e0e6ed;
  --shadow-color: rgba(106, 136, 224, 0.1);
  --success-color: #4CAF50;
  --green-color: #4CAF50;
}

.container {
  width: 360px;
  padding: 20px;
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  position: relative;
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
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
}

.title-container {
  text-align: left;
}

h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.2;
}

header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--label-color);
}

.settings {
  transition: opacity 0.3s;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.basic-settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.basic-settings-grid .setting-group {
  margin-bottom: 0;
}

.setting-group {
  background-color: var(--card-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.2s ease-in-out;
  color: var(--label-color);
}

.setting-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.setting-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--label-color);
}

.setting-group.checkbox {
  padding: 12px 16px;
}

.setting-group.checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0;
  width: 100%;
}

select,
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-sizing: border-box;
  background-color: #fdfdff;
  color: #000;
  transition: border-color 0.2s, box-shadow 0.2s;
}

select:focus,
input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(106, 136, 224, 0.2);
}

select option {
  color: #000;
}

/* Custom Checkbox as a Switch */
.setting-group.checkbox .label-text {
  margin-left: 12px;
}

.setting-group.checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  width: 40px;
  height: 22px;
  background-color: #dce4ec;
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.setting-group.checkbox input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.setting-group.checkbox input[type="checkbox"]:checked {
  background-color: var(--primary-color);
}

.setting-group.checkbox input[type="checkbox"]:checked::before {
  transform: translateX(18px);
}

/* Custom Range Input */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: #e0e6ed;
  border-radius: 3px;
  outline: none;
  padding: 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-note {
  font-size: 12px;
  color: #90a4ae;
  margin-top: 8px;
  text-align: left;
}


/* API Settings */
.api-settings {
  padding: 0;
  overflow: hidden;
}

.api-header,
.advanced-api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  padding: 16px;
}

.toggle-icon {
  color: var(--primary-color);
  transition: transform 0.3s ease;
}

.toggle-icon.is-open {
  transform: rotate(180deg);
}

.api-content {
  padding: 0 16px 16px;
  border-top: 1px solid var(--border-color);
}

.sub-setting-group {
  margin-bottom: 12px;
}

.sub-setting-group:last-child {
  margin-bottom: 0;
}

.sub-setting-group label {
  font-size: 13px;
  margin-bottom: 6px;
}

.advanced-api-header {
  padding: 12px 0;
  font-size: 14px;
  font-weight: normal;
  color: var(--label-color);
}

.advanced-api-content {
  margin-top: 8px;
  padding: 12px;
  background-color: var(--border-color);
  border-radius: 8px;
}

.advanced-api-content .sub-setting-group label {
  color: var(--label-color);
}

.advanced-api-content input[type="text"],
.advanced-api-content input[type="password"] {
  background-color: #ffffff;
}


/* Buttons */
.button-container {
  display: flex;
  justify-content: flex-end;
  /* Adjusted for two buttons */
  gap: 12px;
  /* Adds space between buttons */
  margin-top: 24px;
}

button {
  flex-grow: 1;
  /* Allows buttons to grow and fill container */
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(106, 136, 224, 0.3);
}

button:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106, 136, 224, 0.4);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.manual-translate-btn {
  position: absolute;
  top: 13px;
  right: 16px;
  width: auto;
  height: auto;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(255, 175, 204, 0.4);
  flex-grow: 0;
  transition: all 0.2s ease-in-out;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.manual-translate-btn:hover {
  background-color: #ff9ebf;
  box-shadow: 0 4px 12px rgba(255, 175, 204, 0.6);
  transform: translateY(-2px);
}

.save-message-container {
  text-align: center;
  margin-top: 12px;
  height: 20px;
}

.save-message {
  color: var(--success-color);
  font-size: 14px;
  font-weight: 500;
}

footer {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #90a4ae;
}

/* Keep style preview styles as they are functional */
.style-preview {
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.style-preview .wxt-english.wxt-style-default {
  color: #4a6fa5;
}

.style-preview .wxt-english.wxt-style-subtle {
  color: #6c757d;
  opacity: 0.8;
}

.style-preview .wxt-english.wxt-style-bold {
  color: #4a6fa5;
  font-weight: bold;
}

.style-preview .wxt-english.wxt-style-italic {
  color: #4a6fa5;
  font-style: italic;
}

.style-preview .wxt-english.wxt-style-underlined {
  color: #4a6fa5;
  text-decoration: underline;
}

.style-preview .wxt-english.wxt-style-highlighted {
  color: #212529;
  background-color: #ffeb3b;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
