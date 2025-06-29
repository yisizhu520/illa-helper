<template>
  <div
    v-if="visible"
    :class="[
      'illa-enhancement-container',
      `illa-enhancement-container--${layout}`,
      { 'illa-enhancement-container--minimized': isMinimized },
    ]"
    :style="containerStyle"
  >
    <!-- 容器头部 -->
    <div class="illa-enhancement-container__header">
      <div class="illa-enhancement-container__title">
        <span class="illa-enhancement-container__icon">✨</span>
        <span class="illa-enhancement-container__text">
          智能增强 ({{ enhancements.length }})
        </span>
      </div>
      <div class="illa-enhancement-container__controls">
        <button
          class="illa-enhancement-container__control-btn"
          @click="toggleMinimize"
          :title="isMinimized ? '展开' : '最小化'"
        >
          {{ isMinimized ? '📤' : '📥' }}
        </button>
        <button
          class="illa-enhancement-container__control-btn"
          @click="close"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 容器内容 -->
    <div v-if="!isMinimized" class="illa-enhancement-container__content">
      <!-- 增强项列表 -->
      <div class="illa-enhancement-container__list">
        <template v-for="enhancement in enhancements" :key="enhancement.id">
          <!-- 写作增强专用卡片 -->
          <WritingEnhancementCard
            v-if="enhancement.type === 'writing'"
            :enhancement="enhancement"
            @helpful="onEnhancementHelpful"
            @dismiss="onEnhancementDismiss"
            @more="onEnhancementMore"
          />

          <!-- 通用增强展示 -->
          <div v-else class="illa-enhancement-container__item">
            <div class="illa-enhancement-container__item-header">
              <span class="illa-enhancement-container__item-icon">
                {{ getTypeIcon(enhancement.type) }}
              </span>
              <h4 class="illa-enhancement-container__item-title">
                {{ enhancement.title }}
              </h4>
              <div class="illa-enhancement-container__item-confidence">
                {{ Math.round(enhancement.confidence * 100) }}%
              </div>
            </div>
            <div class="illa-enhancement-container__item-content">
              {{ enhancement.content }}
            </div>
            <div class="illa-enhancement-container__item-actions">
              <button
                class="illa-enhancement-container__item-btn"
                @click="onEnhancementHelpful(enhancement)"
                title="有用"
              >
                👍
              </button>
              <button
                class="illa-enhancement-container__item-btn"
                @click="onEnhancementDismiss(enhancement)"
                title="忽略"
              >
                🗑️
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- 空状态 -->
      <div
        v-if="enhancements.length === 0"
        class="illa-enhancement-container__empty"
      >
        <div class="illa-enhancement-container__empty-icon">🤖</div>
        <div class="illa-enhancement-container__empty-text">
          暂无智能增强建议
        </div>
      </div>

      <!-- 容器底部操作 -->
      <div class="illa-enhancement-container__footer">
        <button
          class="illa-enhancement-container__footer-btn"
          @click="refresh"
          title="刷新建议"
        >
          🔄 刷新
        </button>
        <button
          class="illa-enhancement-container__footer-btn"
          @click="clearAll"
          title="清空所有"
        >
          🗑️ 清空
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Enhancement, EnhancementCategory } from '../../core/types';
import WritingEnhancementCard from './WritingEnhancementCard.vue';

interface Props {
  enhancements: Enhancement[];
  visible: boolean;
  position?: { x: number; y: number };
  layout?: 'floating' | 'sidebar' | 'bottom';
  maxWidth?: number;
  maxHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'floating',
  maxWidth: 400,
  maxHeight: 600,
});

const emit = defineEmits<{
  close: [];
  helpful: [enhancement: Enhancement];
  dismiss: [enhancement: Enhancement];
  more: [enhancement: Enhancement];
  refresh: [];
  clearAll: [];
}>();

const isMinimized = ref(false);

// 计算容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {
    maxWidth: `${props.maxWidth}px`,
    maxHeight: `${props.maxHeight}px`,
  };

  if (props.layout === 'floating' && props.position) {
    style.position = 'fixed';
    style.left = `${props.position.x}px`;
    style.top = `${props.position.y}px`;
    style.zIndex = '10000';
  }

  return style;
});

// 获取类型图标
const getTypeIcon = (type: EnhancementCategory): string => {
  const iconMap: Record<EnhancementCategory, string> = {
    writing: '✍️',
    thinking: '🧠',
    creativity: '💡',
    vocabulary: '📚',
    communication: '💬',
    verification: '🔍',
    knowledge: '🔗',
    data: '📊',
    time: '⏰',
    decision: '⚖️',
  };
  return iconMap[type] || '✨';
};

// 切换最小化状态
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// 关闭容器
const close = () => {
  emit('close');
};

// 增强项操作处理
const onEnhancementHelpful = (enhancement: Enhancement) => {
  emit('helpful', enhancement);
};

const onEnhancementDismiss = (enhancement: Enhancement) => {
  emit('dismiss', enhancement);
};

const onEnhancementMore = (enhancement: Enhancement) => {
  emit('more', enhancement);
};

// 容器操作
const refresh = () => {
  emit('refresh');
};

const clearAll = () => {
  emit('clearAll');
};
</script>

<style scoped>
.illa-enhancement-container {
  background: var(--illa-container-bg, #ffffff);
  border: 1px solid var(--illa-container-border, #e5e7eb);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.illa-enhancement-container--floating {
  position: fixed;
  resize: both;
  min-width: 320px;
  min-height: 200px;
}

.illa-enhancement-container--sidebar {
  position: fixed;
  right: 20px;
  top: 20px;
  bottom: 20px;
  width: 400px;
  max-height: none;
  resize: horizontal;
}

.illa-enhancement-container--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50vh;
  border-radius: 16px 16px 0 0;
  resize: vertical;
}

.illa-enhancement-container--minimized {
  min-height: auto;
}

/* 头部样式 */
.illa-enhancement-container__header {
  padding: 16px 20px;
  background: var(--illa-header-bg, #f8fafc);
  border-bottom: 1px solid var(--illa-container-border, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.illa-enhancement-container__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--illa-header-text, #1f2937);
}

.illa-enhancement-container__icon {
  font-size: 18px;
}

.illa-enhancement-container__controls {
  display: flex;
  gap: 4px;
}

.illa-enhancement-container__control-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.illa-enhancement-container__control-btn:hover {
  background: var(--illa-control-hover, #e5e7eb);
}

/* 内容样式 */
.illa-enhancement-container__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100% - 72px);
}

.illa-enhancement-container__list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 通用增强项样式 */
.illa-enhancement-container__item {
  padding: 16px;
  background: var(--illa-item-bg, #f9fafb);
  border: 1px solid var(--illa-item-border, #e5e7eb);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.illa-enhancement-container__item:hover {
  background: var(--illa-item-hover-bg, #f3f4f6);
}

.illa-enhancement-container__item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.illa-enhancement-container__item-icon {
  font-size: 16px;
}

.illa-enhancement-container__item-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--illa-item-title, #1f2937);
}

.illa-enhancement-container__item-confidence {
  font-size: 12px;
  color: var(--illa-item-meta, #6b7280);
  font-weight: 500;
}

.illa-enhancement-container__item-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--illa-item-text, #374151);
  margin-bottom: 12px;
}

.illa-enhancement-container__item-actions {
  display: flex;
  gap: 8px;
}

.illa-enhancement-container__item-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--illa-item-btn-border, #d1d5db);
  background: var(--illa-item-btn-bg, #ffffff);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.illa-enhancement-container__item-btn:hover {
  background: var(--illa-item-btn-hover-bg, #f3f4f6);
  border-color: var(--illa-item-btn-hover-border, #9ca3af);
}

/* 空状态样式 */
.illa-enhancement-container__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--illa-empty-text, #6b7280);
}

.illa-enhancement-container__empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.illa-enhancement-container__empty-text {
  font-size: 14px;
  text-align: center;
}

/* 底部操作栏 */
.illa-enhancement-container__footer {
  padding: 12px 16px;
  background: var(--illa-footer-bg, #f8fafc);
  border-top: 1px solid var(--illa-container-border, #e5e7eb);
  display: flex;
  gap: 8px;
}

.illa-enhancement-container__footer-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--illa-footer-btn-border, #d1d5db);
  background: var(--illa-footer-btn-bg, #ffffff);
  color: var(--illa-footer-btn-text, #374151);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.illa-enhancement-container__footer-btn:hover {
  background: var(--illa-footer-btn-hover-bg, #f3f4f6);
  border-color: var(--illa-footer-btn-hover-border, #9ca3af);
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .illa-enhancement-container {
    --illa-container-bg: #1f2937;
    --illa-container-border: #374151;
    --illa-header-bg: #111827;
    --illa-header-text: #f9fafb;
    --illa-control-hover: #374151;
    --illa-item-bg: #111827;
    --illa-item-border: #374151;
    --illa-item-hover-bg: #1f2937;
    --illa-item-title: #f9fafb;
    --illa-item-text: #d1d5db;
    --illa-item-meta: #9ca3af;
    --illa-item-btn-bg: #374151;
    --illa-item-btn-border: #4b5563;
    --illa-item-btn-hover-bg: #4b5563;
    --illa-item-btn-hover-border: #6b7280;
    --illa-empty-text: #9ca3af;
    --illa-footer-bg: #111827;
    --illa-footer-btn-bg: #374151;
    --illa-footer-btn-border: #4b5563;
    --illa-footer-btn-text: #d1d5db;
    --illa-footer-btn-hover-bg: #4b5563;
    --illa-footer-btn-hover-border: #6b7280;
  }
}

/* 滚动条样式 */
.illa-enhancement-container__list::-webkit-scrollbar {
  width: 6px;
}

.illa-enhancement-container__list::-webkit-scrollbar-track {
  background: var(--illa-scrollbar-track, #f1f5f9);
  border-radius: 3px;
}

.illa-enhancement-container__list::-webkit-scrollbar-thumb {
  background: var(--illa-scrollbar-thumb, #cbd5e1);
  border-radius: 3px;
}

.illa-enhancement-container__list::-webkit-scrollbar-thumb:hover {
  background: var(--illa-scrollbar-thumb-hover, #94a3b8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .illa-enhancement-container--floating {
    min-width: 280px;
  }

  .illa-enhancement-container--sidebar {
    width: 100vw;
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    height: 60vh;
    border-radius: 16px 16px 0 0;
  }

  .illa-enhancement-container__header {
    padding: 12px 16px;
  }

  .illa-enhancement-container__list {
    padding: 12px;
    gap: 12px;
  }
}
</style>
