/**
 * 悬浮球模块入口
 */

// 导出类型
export type {
  FloatingBallConfig,
  FloatingBallState,
  FloatingBallEventType,
} from './types';

// 导出配置
export {
  DEFAULT_FLOATING_BALL_CONFIG,
  FLOATING_BALL_STYLES,
  DRAG_CONFIG,
} from './config';

// 导出管理器
export { FloatingBallManager } from './managers/FloatingBallManager';
