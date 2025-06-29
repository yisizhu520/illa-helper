<template>
  <div
    v-if="visible"
    :class="[
      'illa-enhancement-tooltip',
      `illa-enhancement-tooltip--${enhancement.type}`,
      { 'illa-enhancement-tooltip--pinned': isPinned }
    ]"
    :style="positionStyle"
    @click.stop
  >
    <!-- 工具提示头部 -->
    <div class="illa-enhancement-tooltip__header">
      <div class="illa-enhancement-tooltip__title-row">
        <span class="illa-enhancement-tooltip__icon">{{ getTypeIcon(enhancement.type) }}</span>
        <h4 class="illa-enhancement-tooltip__title">{{ enhancement.title }}</h4>
        <div class="illa-enhancement-tooltip__actions">
          <button
            v-if="showPinButton"
            :class="[
              'illa-enhancement-tooltip__pin-btn',
              { 'illa-enhancement-tooltip__pin-btn--active': isPinned }
            ]"
            @click="togglePin"
            :title="isPinned ? '取消固定' : '固定'"
          >
            📌
          </button>
          <button
            class="illa-enhancement-tooltip__close-btn"
            @click="close"
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- 可信度指示器 -->
      <div v-if="showConfidence" class="illa-enhancement-tooltip__confidence">
        <div class="illa-enhancement-tooltip__confidence-bar">
          <div 
            class="illa-enhancement-tooltip__confidence-fill"
            :style="{ width: `${enhancement.confidence * 100}%` }"
          ></div>
        </div>
        <span class="illa-enhancement-tooltip__confidence-text">
          可信度: {{ Math.round(enhancement.confidence * 100) }}%
        </span>
      </div>
    </div>

    <!-- 工具提示内容 -->
    <div class="illa-enhancement-tooltip__content">
      <div class="illa-enhancement-tooltip__body">
        {{ enhancement.content }}
      </div>
    </div>

    <!-- 工具提示箭头 -->
    <div 
      :class="[
        'illa-enhancement-tooltip__arrow',
        `illa-enhancement-tooltip__arrow--${arrowPosition}`
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Enhancement, EnhancementCategory } from '../../core/types';

interface Props {
  enhancement: Enhancement;
  visible: boolean;
  position: { x: number; y: number };
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
  showConfidence?: boolean;
  showPinButton?: boolean;
  maxWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showConfidence: true,
  showPinButton: true,
  maxWidth: 320,
});

const emit = defineEmits<{
  close: [];
  pin: [pinned: boolean];
  positionUpdate: [position: { x: number; y: number }];
}>();

const isPinned = ref(false);

// 计算定位样式
const positionStyle = computed(() => ({
  position: 'absolute',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  maxWidth: `${props.maxWidth}px`,
  zIndex: 10000,
}));

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

// 切换固定状态
const togglePin = () => {
  isPinned.value = !isPinned.value;
  emit('pin', isPinned.value);
};

// 关闭工具提示
const close = () => {
  emit('close');
};

// 处理点击外部关闭（仅在未固定时）
const handleClickOutside = (event: MouseEvent) => {
  if (!isPinned.value) {
    const tooltip = event.target as HTMLElement;
    if (!tooltip.closest('.illa-enhancement-tooltip')) {
      close();
    }
  }
};

onMounted(() => {
  // 延迟添加事件监听，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.illa-enhancement-tooltip {
  background: var(--illa-tooltip-bg, #ffffff);
  border: 1px solid var(--illa-tooltip-border, #e1e5e9);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--illa-tooltip-text, #333333);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.illa-enhancement-tooltip--pinned {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  border-color: var(--illa-accent-color, #4f46e5);
}

/* 头部样式 */
.illa-enhancement-tooltip__header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--illa-tooltip-border, #e1e5e9);
}

.illa-enhancement-tooltip__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.illa-enhancement-tooltip__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.illa-enhancement-tooltip__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: var(--illa-tooltip-title, #1f2937);
}

.illa-enhancement-tooltip__actions {
  display: flex;
  gap: 4px;
}

.illa-enhancement-tooltip__pin-btn,
.illa-enhancement-tooltip__close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.illa-enhancement-tooltip__pin-btn:hover,
.illa-enhancement-tooltip__close-btn:hover {
  background: var(--illa-tooltip-hover-bg, #f3f4f6);
}

.illa-enhancement-tooltip__pin-btn--active {
  background: var(--illa-accent-color, #4f46e5);
  color: white;
}

/* 可信度指示器 */
.illa-enhancement-tooltip__confidence {
  display: flex;
  align-items: center;
  gap: 8px;
}

.illa-enhancement-tooltip__confidence-bar {
  flex: 1;
  height: 4px;
  background: var(--illa-confidence-bg, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.illa-enhancement-tooltip__confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%);
  transition: width 0.3s ease;
}

.illa-enhancement-tooltip__confidence-text {
  font-size: 12px;
  color: var(--illa-tooltip-meta, #6b7280);
  white-space: nowrap;
}

/* 内容样式 */
.illa-enhancement-tooltip__content {
  padding: 16px;
}

.illa-enhancement-tooltip__body {
  line-height: 1.6;
  color: var(--illa-tooltip-text, #374151);
}

/* 箭头样式 */
.illa-enhancement-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

.illa-enhancement-tooltip__arrow--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--illa-tooltip-bg, #ffffff);
}

.illa-enhancement-tooltip__arrow--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--illa-tooltip-bg, #ffffff);
}

.illa-enhancement-tooltip__arrow--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--illa-tooltip-bg, #ffffff);
}

.illa-enhancement-tooltip__arrow--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--illa-tooltip-bg, #ffffff);
}

/* 类型特定样式 */
.illa-enhancement-tooltip--writing {
  border-left: 4px solid #8b5cf6;
}

.illa-enhancement-tooltip--thinking {
  border-left: 4px solid #06b6d4;
}

.illa-enhancement-tooltip--creativity {
  border-left: 4px solid #f59e0b;
}

.illa-enhancement-tooltip--vocabulary {
  border-left: 4px solid #10b981;
}

.illa-enhancement-tooltip--communication {
  border-left: 4px solid #ec4899;
}

.illa-enhancement-tooltip--verification {
  border-left: 4px solid #ef4444;
}

.illa-enhancement-tooltip--knowledge {
  border-left: 4px solid #6366f1;
}

.illa-enhancement-tooltip--data {
  border-left: 4px solid #14b8a6;
}

.illa-enhancement-tooltip--time {
  border-left: 4px solid #f97316;
}

.illa-enhancement-tooltip--decision {
  border-left: 4px solid #84cc16;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .illa-enhancement-tooltip {
    --illa-tooltip-bg: #1f2937;
    --illa-tooltip-border: #374151;
    --illa-tooltip-text: #f9fafb;
    --illa-tooltip-title: #ffffff;
    --illa-tooltip-meta: #9ca3af;
    --illa-tooltip-hover-bg: #374151;
    --illa-confidence-bg: #374151;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .illa-enhancement-tooltip {
    max-width: 280px !important;
    font-size: 13px;
  }
  
  .illa-enhancement-tooltip__header {
    padding: 12px 12px 8px;
  }
  
  .illa-enhancement-tooltip__content {
    padding: 12px;
  }
  
  .illa-enhancement-tooltip__title {
    font-size: 14px;
  }
}
</style> 