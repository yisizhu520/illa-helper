<template>
  <div class="space-y-2">
    <!-- 分组标题 -->
    <h3
      class="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-2"
    >
      {{ title }}
    </h3>

    <!-- 菜单项列表 -->
    <div class="space-y-1">
      <NavigationItem
        v-for="item in items"
        :key="item.key"
        :item="item"
        :is-active="currentSection === item.key"
        @click="handleItemClick(item.key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationItem from './NavigationItem.vue';

interface NavigationItemData {
  key: string;
  label: string;
  icon: any;
  description?: string;
}

interface Props {
  title: string;
  items: NavigationItemData[];
  currentSection: string;
}

defineProps<Props>();

const emit = defineEmits<{
  sectionChange: [section: string];
}>();

const handleItemClick = (section: string) => {
  emit('sectionChange', section);
};
</script>
