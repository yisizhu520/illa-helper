/**
 * 悬浮球功能类型定义
 */

// 悬浮球配置接口
export interface FloatingBallConfig {
  enabled: boolean; // 是否启用悬浮球
  position: number; // 垂直位置百分比 (0-100)
  opacity: number; // 透明度 (0.1-1.0)
}

// 悬浮球事件类型
export type FloatingBallEventType = 'translate' | 'drag' | 'click';

// 悬浮球状态
export interface FloatingBallState {
  isDragging: boolean;
  isVisible: boolean;
  currentPosition: number;
}
