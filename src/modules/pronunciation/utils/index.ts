/**
 * 工具类模块统一导出
 */

export * from './TimerManager';
export * from './PositionUtils';
export * from './DOMUtils';

// 便捷导入
export { TimerManager } from './TimerManager';
export {
  PositionUtils,
  type TooltipPosition,
  type PositionResult,
} from './PositionUtils';
export { DOMUtils } from './DOMUtils';
