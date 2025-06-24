<template>
  <div class="flex-1 overflow-y-auto bg-background">
    <!-- 内容区域 -->
    <div class="p-6">
      <Transition name="fade" mode="out-in">
        <component
          :is="currentComponent"
          :key="currentSection"
          @save-message="handleSaveMessage"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BlacklistManagement from './blacklist/BlacklistManagement.vue';
import BasicSettings from './BasicSettings.vue';

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
  translation: BlacklistManagement,
  ai: BlacklistManagement,
  pronunciation: BlacklistManagement,
  blacklist: BlacklistManagement,
  // 暂时使用黑名单组件代替尚未实现的功能
  subtitle: BlacklistManagement,
  image: BlacklistManagement,
  input: BlacklistManagement,
  speech: BlacklistManagement,
  floating: BlacklistManagement,
  hotkey: BlacklistManagement,
  advanced: BlacklistManagement,
  import: BlacklistManagement,
  about: BlacklistManagement,
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
