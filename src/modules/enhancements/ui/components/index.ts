// 增强功能UI组件导出
export { default as EnhancementTooltip } from './EnhancementTooltip.vue';
export { default as WritingEnhancementCard } from './WritingEnhancementCard.vue';
export { default as EnhancementContainer } from './EnhancementContainer.vue';
export { default as DebugPanel } from './DebugPanel.vue';

// 组件类型定义
export interface UIPosition {
  x: number;
  y: number;
}

export type TooltipArrowPosition = 'top' | 'bottom' | 'left' | 'right';
export type ContainerLayout = 'floating' | 'sidebar' | 'bottom';

export interface EnhancementUIEvents {
  close: [];
  pin: [pinned: boolean];
  helpful: [enhancementId: string];
  dismiss: [enhancementId: string];
  more: [enhancementId: string];
  refresh: [];
  clearAll: [];
  positionUpdate: [position: UIPosition];
}
