/**
 * 发音模块常量定义
 */

// 缓存相关常量
export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 86400, // 24小时（秒）
  MAX_CACHE_SIZE: 1000, // 最大缓存条目数
} as const;

// UI相关常量
export const UI_CONSTANTS = {
  TOOLTIP_Z_INDEX: 10000,
  WORD_TOOLTIP_Z_INDEX: 10001,
  TOOLTIP_PADDING: 12,
  TOOLTIP_ARROW_SIZE: 8,
} as const;

// 定时器相关常量
export const TIMER_CONSTANTS = {
  SHOW_DELAY: 400, // 显示延迟（毫秒）
  HIDE_DELAY: 600, // 隐藏延迟（毫秒）
  WORD_SHOW_DELAY: 300, // 单词悬浮框显示延迟（毫秒）
  YOUDAO_TIMEOUT: 10000, // 有道TTS超时时间（毫秒）
} as const;

// CSS类名常量
export const CSS_CLASSES = {
  PRONUNCIATION_ENABLED: 'wxt-pronunciation-enabled',
  PRONUNCIATION_LOADING: 'wxt-pronunciation-loading',
  PHONETIC_INLINE: 'wxt-phonetic-inline',
  PRONUNCIATION_TOOLTIP: 'wxt-pronunciation-tooltip',
  WORD_TOOLTIP: 'wxt-word-tooltip',
  INTERACTIVE_WORD: 'wxt-interactive-word',
} as const;

// 提供者相关常量
export const PROVIDER_CONSTANTS = {
  DEFAULT_PHONETIC_PROVIDER: 'dictionary-api',
  DEFAULT_TTS_PROVIDER: 'youdao',
  FALLBACK_TTS_PROVIDER: 'web-speech',
} as const;

// API相关常量
export const API_CONSTANTS = {
  YOUDAO_TTS_BASE_URL: 'https://dict.youdao.com/dictvoice',
  DICTIONARY_API_BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
} as const;
