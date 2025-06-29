<template>
  <div class="illa-writing-card">
    <!-- 卡片头部 -->
    <div class="illa-writing-card__header">
      <div class="illa-writing-card__type">
        <span class="illa-writing-card__type-icon">✍️</span>
        <span class="illa-writing-card__type-text">{{ suggestionType }}</span>
      </div>
      <div class="illa-writing-card__confidence">
        <div
          class="illa-writing-card__confidence-dot"
          :class="confidenceLevel"
        ></div>
        <span class="illa-writing-card__confidence-text">
          {{ Math.round(enhancement.confidence * 100) }}%
        </span>
      </div>
    </div>

    <!-- 建议标题 -->
    <h3 class="illa-writing-card__title">{{ enhancement.title }}</h3>

    <!-- 建议内容 -->
    <div class="illa-writing-card__content">
      <div class="illa-writing-card__suggestion">
        {{ enhancement.content }}
      </div>

      <!-- 原文引用（如果有） -->
      <div v-if="originalText" class="illa-writing-card__original">
        <div class="illa-writing-card__original-label">原文：</div>
        <div class="illa-writing-card__original-text">{{ originalText }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="illa-writing-card__actions">
      <button
        class="illa-writing-card__action-btn illa-writing-card__action-btn--helpful"
        @click="markHelpful"
        :class="{ 'illa-writing-card__action-btn--active': isMarkedHelpful }"
        title="标记为有用"
      >
        👍 有用
      </button>
      <button
        class="illa-writing-card__action-btn illa-writing-card__action-btn--dismiss"
        @click="dismiss"
        title="忽略此建议"
      >
        🗑️ 忽略
      </button>
      <button
        class="illa-writing-card__action-btn illa-writing-card__action-btn--more"
        @click="showMore"
        title="查看更多建议"
      >
        💡 更多
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Enhancement } from '../../core/types';

interface Props {
  enhancement: Enhancement;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  helpful: [enhancement: Enhancement];
  dismiss: [enhancement: Enhancement];
  more: [enhancement: Enhancement];
}>();

const isMarkedHelpful = ref(false);

// 从enhancement.context.additionalData中提取建议类型
const suggestionType = computed(() => {
  const analysisType = props.enhancement.context.additionalData?.analysisType;
  const typeMap: Record<string, string> = {
    语法: '语法改进',
    表达: '表达优化',
    结构: '结构调整',
    词汇: '词汇提升',
    其他: '写作建议',
  };
  return typeMap[analysisType] || '写作建议';
});

// 从enhancement.context.additionalData中提取原文
const originalText = computed(() => {
  return props.enhancement.context.additionalData?.originalText;
});

// 计算可信度等级
const confidenceLevel = computed(() => {
  const confidence = props.enhancement.confidence;
  if (confidence >= 0.8) return 'illa-writing-card__confidence-dot--high';
  if (confidence >= 0.6) return 'illa-writing-card__confidence-dot--medium';
  return 'illa-writing-card__confidence-dot--low';
});

// 标记为有用
const markHelpful = () => {
  isMarkedHelpful.value = !isMarkedHelpful.value;
  emit('helpful', props.enhancement);
};

// 忽略建议
const dismiss = () => {
  emit('dismiss', props.enhancement);
};

// 查看更多建议
const showMore = () => {
  emit('more', props.enhancement);
};
</script>

<style scoped>
.illa-writing-card {
  background: var(--illa-card-bg, #ffffff);
  border: 1px solid var(--illa-card-border, #e5e7eb);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s ease;
  position: relative;
  max-width: 400px;
}

.illa-writing-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 头部样式 */
.illa-writing-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.illa-writing-card__type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--illa-type-bg, #f3f4f6);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--illa-type-text, #6b7280);
}

.illa-writing-card__type-icon {
  font-size: 14px;
}

.illa-writing-card__confidence {
  display: flex;
  align-items: center;
  gap: 6px;
}

.illa-writing-card__confidence-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.illa-writing-card__confidence-dot--high {
  background: #10b981;
}

.illa-writing-card__confidence-dot--medium {
  background: #f59e0b;
}

.illa-writing-card__confidence-dot--low {
  background: #ef4444;
}

.illa-writing-card__confidence-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--illa-confidence-text, #6b7280);
}

/* 标题样式 */
.illa-writing-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--illa-card-title, #1f2937);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* 内容样式 */
.illa-writing-card__content {
  margin-bottom: 20px;
}

.illa-writing-card__suggestion {
  font-size: 14px;
  line-height: 1.6;
  color: var(--illa-card-text, #374151);
  margin-bottom: 12px;
}

.illa-writing-card__original {
  padding: 12px;
  background: var(--illa-original-bg, #f9fafb);
  border-radius: 8px;
  border-left: 4px solid var(--illa-accent-color, #8b5cf6);
}

.illa-writing-card__original-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--illa-original-label, #6b7280);
  margin-bottom: 4px;
}

.illa-writing-card__original-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--illa-original-text, #4b5563);
  font-style: italic;
}

/* 操作按钮样式 */
.illa-writing-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.illa-writing-card__action-btn {
  flex: 1;
  min-width: 80px;
  padding: 8px 12px;
  border: 1px solid var(--illa-btn-border, #d1d5db);
  border-radius: 8px;
  background: var(--illa-btn-bg, #ffffff);
  color: var(--illa-btn-text, #374151);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.illa-writing-card__action-btn:hover {
  background: var(--illa-btn-hover-bg, #f9fafb);
  border-color: var(--illa-btn-hover-border, #9ca3af);
}

.illa-writing-card__action-btn--helpful {
  border-color: #10b981;
  color: #10b981;
}

.illa-writing-card__action-btn--helpful:hover {
  background: #ecfdf5;
  border-color: #059669;
}

.illa-writing-card__action-btn--helpful.illa-writing-card__action-btn--active {
  background: #10b981;
  color: white;
}

.illa-writing-card__action-btn--dismiss {
  border-color: #ef4444;
  color: #ef4444;
}

.illa-writing-card__action-btn--dismiss:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

.illa-writing-card__action-btn--more {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.illa-writing-card__action-btn--more:hover {
  background: #f5f3ff;
  border-color: #7c3aed;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .illa-writing-card {
    --illa-card-bg: #1f2937;
    --illa-card-border: #374151;
    --illa-card-title: #f9fafb;
    --illa-card-text: #d1d5db;
    --illa-type-bg: #374151;
    --illa-type-text: #9ca3af;
    --illa-confidence-text: #9ca3af;
    --illa-original-bg: #111827;
    --illa-original-label: #9ca3af;
    --illa-original-text: #d1d5db;
    --illa-btn-bg: #374151;
    --illa-btn-border: #4b5563;
    --illa-btn-text: #d1d5db;
    --illa-btn-hover-bg: #4b5563;
    --illa-btn-hover-border: #6b7280;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .illa-writing-card {
    padding: 16px;
    max-width: 100%;
  }

  .illa-writing-card__title {
    font-size: 15px;
  }

  .illa-writing-card__suggestion {
    font-size: 13px;
  }

  .illa-writing-card__actions {
    gap: 6px;
  }

  .illa-writing-card__action-btn {
    min-width: 70px;
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>
