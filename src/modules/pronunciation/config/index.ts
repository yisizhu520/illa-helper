/**
 * 发音模块配置统一导出
 */

// 导出配置相关
export * from './pronunciation.config';
export * from './constants';

// 便捷导入
export {
  DEFAULT_PRONUNCIATION_CONFIG,
  DEFAULT_TTS_CONFIG,
  DEFAULT_UI_CONFIG,
  ConfigValidator,
  ConfigMerger,
} from './pronunciation.config';

export {
  CACHE_CONSTANTS,
  UI_CONSTANTS,
  TIMER_CONSTANTS,
  CSS_CLASSES,
  PROVIDER_CONSTANTS,
  API_CONSTANTS,
} from './constants';
