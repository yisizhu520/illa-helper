<template>
  <div class="flex-1 overflow-y-auto bg-background">
    <!-- 内容区域 -->
    <div class="p-6">
      <div class="max-w-4xl mx-auto">
        <Transition name="fade" mode="out-in">
          <component :is="currentComponent" :key="currentSection" @save-message="handleSaveMessage" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BlacklistManagement from './blacklist/BlacklistManagement.vue';
import BasicSettings from './basic/BasicSettings.vue';
import TranslationSettings from './translation/TranslationSettings.vue';
import AppearanceSettings from './appearance/AppearanceSettings.vue';
import DataManagement from './data/DataManagement.vue';
import About from './about/About.vue';

interface Props {
  currentSection: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

// 组件映射
const componentMap: Record<string, any> = {
  basic: BasicSettings,
  translation: TranslationSettings,
  blacklist: BlacklistManagement,
  floating: AppearanceSettings,
  about: About,
  data: DataManagement,
};

const currentComponent = computed(() => {
  return componentMap[props.currentSection] || BlacklistManagement;
});

const handleSaveMessage = (message: string) => {
  emit('saveMessage', message);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
