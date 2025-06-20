/**
 * 发音功能相关类型定义
 * 包含音标、朗读、提供者等相关接口
 */

// 音标信息接口
export interface PhoneticInfo {
  word: string;
  phonetics: PhoneticEntry[];
  meanings?: MeaningEntry[];
}

// 音标条目
export interface PhoneticEntry {
  text?: string;      // 音标文本 (如: /ˈhɛloʊ/)
  audio?: string;     // 音频URL
  sourceUrl?: string; // 来源URL
}

// 词义条目
export interface MeaningEntry {
  partOfSpeech: string;
  definitions: DefinitionEntry[];
}

// 定义条目
export interface DefinitionEntry {
  definition: string;
  example?: string;
  synonyms?: string[];
}

// 音标获取结果
export interface PhoneticResult {
  success: boolean;
  data?: PhoneticInfo;
  error?: string;
  cached?: boolean;
}

// TTS配置
export interface TTSConfig {
  provider: 'web-speech' | 'youdao';
  // Web Speech API配置
  lang?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  // 有道TTS配置
  accent?: 'us' | 'uk'; // 美式或英式发音
}

// TTS结果
export interface TTSResult {
  success: boolean;
  error?: string;
}

// 发音UI配置
export interface PronunciationUIConfig {
  showPhonetic: boolean;
  showPlayButton: boolean;
  tooltipEnabled: boolean;
  inlineDisplay: boolean;
}

// 发音服务配置
export interface PronunciationConfig {
  provider: string;
  apiEndpoint?: string;
  cacheEnabled: boolean;
  cacheTTL: number; // 缓存生存时间(秒)
  ttsConfig: TTSConfig;
  uiConfig: PronunciationUIConfig;
}

// 默认配置
export const DEFAULT_PRONUNCIATION_CONFIG: PronunciationConfig = {
  provider: 'dictionary-api',
  cacheEnabled: true,
  cacheTTL: 86400, // 24小时
  ttsConfig: {
    provider: 'youdao', // 默认使用有道TTS
    lang: 'en-US',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    accent: 'us', // 默认美式发音
  },
  uiConfig: {
    showPhonetic: true,
    showPlayButton: true,
    tooltipEnabled: true,
    inlineDisplay: false, // 禁用内联显示，只在悬浮框中显示
  },
};

// 缓存条目
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 发音元素数据
export interface PronunciationElementData {
  word: string;
  element: HTMLElement;
  phonetic?: PhoneticInfo;
  tooltip?: HTMLElement;
}
