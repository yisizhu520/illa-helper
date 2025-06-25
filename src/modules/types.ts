/**
 * Types and Defaults Module
 * This file contains shared type definitions and default constants to avoid circular dependencies.
 */

// From apiService.ts
export interface Replacement {
  original: string;
  translation: string;
  position: {
    start: number;
    end: number;
  };
  isNew: boolean;
  explanation?: string;
  // 发音相关字段
  hasPhonetic?: boolean;
  phoneticData?: any; // 将在pronunciation模块中定义具体类型
  // 新增：语言检测信息
  detectedSourceLanguage?: string;
  targetLanguage?: string;
}

export interface FullTextAnalysisResponse {
  original: string;
  processed: string;
  replacements: Replacement[];
}

export interface ApiConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  temperature: number;
  enable_thinking?: boolean;
  phraseEnabled?: boolean;
}

export interface ReplacementConfig {
  userLevel: UserLevel;
  replacementRate: number;
  useGptApi: boolean;
  apiConfig: ApiConfig;
  inlineTranslation: boolean;
  translationStyle: TranslationStyle;
  translationDirection: string;
}

// 简化：多语言翻译配置接口
export interface MultilingualConfig {
  intelligentMode: boolean;
  targetLanguage: string;
  sourceLanguageOverride?: string; // 用户手动指定源语言时使用
}

// 新增：语言选项接口
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isPopular?: boolean;
}

// 新增：快捷键配置接口
export interface TooltipHotkey {
  enabled: boolean; // 是否启用快捷键要求（Ctrl+鼠标悬停）
}

// 悬浮球配置接口
export interface FloatingBallConfig {
  enabled: boolean; // 是否启用悬浮球
  position: number; // 垂直位置百分比 (0-100)
  opacity: number; // 透明度 (0.1-1.0)
}

// 默认悬浮球配置
export const DEFAULT_FLOATING_BALL_CONFIG: FloatingBallConfig = {
  enabled: true,
  position: 50, // 中间位置
  opacity: 0.8, // 80% 透明度
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  apiKey: import.meta.env.VITE_WXT_DEFAULT_API_KEY,
  apiEndpoint: import.meta.env.VITE_WXT_DEFAULT_API_ENDPOINT,
  model: import.meta.env.VITE_WXT_DEFAULT_MODEL,
  temperature: parseFloat(import.meta.env.VITE_WXT_DEFAULT_TEMPERATURE) || 0.7,
  enable_thinking: false,
  phraseEnabled: true,
};

export enum UserLevel {
  BEGINNER = 1,
  ELEMENTARY = 2,
  INTERMEDIATE = 3,
  ADVANCED = 4,
  PROFICIENT = 5,
}

/**
 * UserLevel 选项配置，包含值和中文标签
 */
export const USER_LEVEL_OPTIONS = [
  { value: UserLevel.BEGINNER, label: '初级' },
  { value: UserLevel.ELEMENTARY, label: '基础' },
  { value: UserLevel.INTERMEDIATE, label: '中级' },
  { value: UserLevel.ADVANCED, label: '高级' },
  { value: UserLevel.PROFICIENT, label: '精通' },
];

export enum TranslationStyle {
  DEFAULT = 'default',
  SUBTLE = 'subtle',
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINED = 'underlined',
  HIGHLIGHTED = 'highlighted',
  LEARNING = 'learning',
}

export enum TriggerMode {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

export enum OriginalWordDisplayMode {
  VISIBLE,
  LEARNING,
  HIDDEN,
}

export enum TranslationPosition {
  BEFORE = 'before',
  AFTER = 'after',
}

export interface UserSettings {
  userLevel: UserLevel;
  replacementRate: number;
  isEnabled: boolean;
  useGptApi: boolean;
  apiConfig: ApiConfig;
  translationStyle: TranslationStyle;
  triggerMode: TriggerMode;
  maxLength?: number;
  translationDirection: string;
  originalWordDisplayMode: OriginalWordDisplayMode;
  enablePronunciationTooltip: boolean;
  // 新增：多语言智能翻译设置
  multilingualConfig: MultilingualConfig;
  // 新增：发音弹出框快捷键设置
  pronunciationHotkey: TooltipHotkey;
  // 新增：悬浮球设置
  floatingBall: FloatingBallConfig;
  // 新增：翻译位置设置
  translationPosition: TranslationPosition;
  // 新增：是否显示括号
  showParentheses: boolean;
}

// 简化：默认多语言配置
export const DEFAULT_MULTILINGUAL_CONFIG: MultilingualConfig = {
  intelligentMode: false,
  targetLanguage: 'en', // 无默认语言，强制用户选择
};

// 默认快捷键配置
export const DEFAULT_TOOLTIP_HOTKEY: TooltipHotkey = {
  enabled: true,
};

export const DEFAULT_SETTINGS: UserSettings = {
  userLevel: UserLevel.BEGINNER,
  replacementRate: 0.2,
  isEnabled: true,
  useGptApi: true,
  apiConfig: DEFAULT_API_CONFIG,
  translationStyle: TranslationStyle.DEFAULT,
  triggerMode: TriggerMode.MANUAL,
  maxLength: 400,
  translationDirection: 'intelligent',
  originalWordDisplayMode: OriginalWordDisplayMode.VISIBLE,
  enablePronunciationTooltip: true,
  multilingualConfig: DEFAULT_MULTILINGUAL_CONFIG,
  pronunciationHotkey: DEFAULT_TOOLTIP_HOTKEY,
  floatingBall: DEFAULT_FLOATING_BALL_CONFIG,
  translationPosition: TranslationPosition.AFTER,
  showParentheses: true,
};
