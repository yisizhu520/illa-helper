/**
 * 悬浮球配置
 */

import type { FloatingBallConfig } from '../types';

// 默认悬浮球配置
export const DEFAULT_FLOATING_BALL_CONFIG: FloatingBallConfig = {
  enabled: true,
  position: 50, // 中间位置
  opacity: 0.8, // 80% 透明度
};

// 悬浮球样式配置 - 自定义蓝色风格
export const FLOATING_BALL_STYLES = {
  size: 48, // 悬浮球大小 (px)
  iconSize: 20, // 图标大小 (px)
  borderRadius: '50%', // 圆形
  zIndex: 10000, // 层级
  right: '0px', // 贴右边
  // 主色：自定义蓝色
  background: '#6A88E0',
  // 悬停：更亮的蓝色
  hoverBackground: '#7B96E5',
  // 激活：绿色
  activeBackground: '#4CAF50',
  // 主要阴影
  boxShadow: '0 4px 12px rgba(106, 136, 224, 0.25)',
  // 悬停阴影
  hoverBoxShadow: '0 6px 16px rgba(106, 136, 224, 0.35)',
  // 激活阴影
  activeBoxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
  transition: 'all 0.2s ease',
  hoverScale: 1.05,
};

// 拖拽配置
export const DRAG_CONFIG = {
  threshold: 5, // 拖拽触发阈值 (px)
  minPosition: 5, // 最小位置 (%)
  maxPosition: 95, // 最大位置 (%)
  animationDuration: 300, // 动画持续时间 (ms)
};
