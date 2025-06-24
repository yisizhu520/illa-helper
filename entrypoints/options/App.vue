<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 主容器 -->
    <div class="flex h-screen">
      <!-- 左侧导航栏 -->
      <OptionsNavigation
        :current-section="currentSection"
        @section-change="handleSectionChange"
      />

      <!-- 右侧内容区域 -->
      <div class="flex-1 flex flex-col">
        <!-- 顶部状态栏 -->
        <div
          class="h-16 bg-card border-b border-border flex items-center justify-between px-6"
        >
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold">
              {{ getSectionTitle(currentSection) }}
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <!-- 保存状态指示器 -->
            <div v-if="saveMessage" class="text-sm text-muted-foreground">
              {{ saveMessage }}
            </div>
            <!-- 主题切换按钮 -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              title="切换主题"
            >
              <component :is="isDark ? Sun : Moon" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 主内容区域 -->
        <OptionsContent
          :current-section="currentSection"
          @save-message="handleSaveMessage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import OptionsNavigation from './components/OptionsNavigation.vue';
import OptionsContent from './components/OptionsContent.vue';

// 当前选中的设置模块
const currentSection = ref('basic');

// 保存状态消息
const saveMessage = ref('');

// 主题状态
const isDark = ref(false);

// 设置模块标题映射
const sectionTitles: Record<string, string> = {
  basic: '基本设置',
  translation: '翻译服务',
  input: '输入框翻译',
  blacklist: '黑名单',
  hotkey: '快捷键',
  floating: '悬浮球',
  advanced: '进阶设置',
};

onMounted(async () => {
  // 优先从存储中加载主题设置
  const storedTheme = await browser.storage.local.get('theme');
  if (storedTheme.theme) {
    isDark.value = storedTheme.theme === 'dark';
  } else {
    // 如果存储中没有，则根据系统偏好设置
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyTheme();
});

const handleSectionChange = (section: string) => {
  currentSection.value = section;
};

const handleSaveMessage = (message: string) => {
  saveMessage.value = message;
  setTimeout(() => {
    saveMessage.value = '';
  }, 3000);
};

const getSectionTitle = (section: string): string => {
  return sectionTitles[section] || '设置';
};

const toggleTheme = async () => {
  isDark.value = !isDark.value;
  applyTheme();
  // 将主题偏好保存到存储中
  await browser.storage.local.set({ theme: isDark.value ? 'dark' : 'light' });
};

const applyTheme = () => {
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};
</script>
