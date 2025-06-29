/**
 * Types and Defaults Module
 * This file contains shared type definitions and default constants to avoid circular dependencies.
 */

// API related types (now in ./api module)
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
  includeThinkingParam?: boolean;
  customParams?: string;
  phraseEnabled?: boolean;
  requestsPerSecond?: number; // 每秒最大请求数
  useBackgroundProxy?: boolean; // 是否通过background script发送请求以绕过CORS
}

// 新增：API配置项接口，包含配置的元数据
export interface ApiConfigItem {
  id: string;
  name: string;
  provider: string; // 服务提供商：openai、deepseek、silicon-flow等
  config: ApiConfig;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
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

export enum TranslationProvider {
  OpenAI = 'OpenAI',
  DeepSeek = 'DeepSeek',
  SiliconFlow = 'SiliconFlow',
  GoogleGemini = 'GoogleGemini',
  ProxyGemini = 'ProxyGemini',
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
  enabled: boolean; // 是否启用快捷键要求
  requireModifier: boolean; // 是否需要修饰键
  modifierKeys: string[]; // 修饰键数组 ['ctrl', 'alt', 'shift']
  key?: string; // 可选的附加键
  description?: string; // 快捷键描述
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
  temperature: parseFloat(import.meta.env.VITE_WXT_DEFAULT_TEMPERATURE) || 0,
  enable_thinking: false,
  includeThinkingParam: false,
  customParams: '',
  phraseEnabled: true,
  requestsPerSecond: 0, // 默认无限制，0表示不限制
  useBackgroundProxy: false, // 默认不使用background代理，保持向后兼容
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
  DOTTED = 'dotted',
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
  // 修改：支持多API配置
  apiConfigs: ApiConfigItem[];
  activeApiConfigId: string;
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
  // 新增：API请求超时时间配置
  apiRequestTimeout: number; // 以毫秒为单位
  // 新增：智能阅读增强系统设置
  enhancementSettings: EnhancementSettings;
}

// 简化：默认多语言配置
export const DEFAULT_MULTILINGUAL_CONFIG: MultilingualConfig = {
  intelligentMode: false,
  targetLanguage: 'en', // 无默认语言，强制用户选择
};

// 默认快捷键配置
export const DEFAULT_TOOLTIP_HOTKEY: TooltipHotkey = {
  enabled: false,
  requireModifier: true,
  modifierKeys: ['ctrl'],
  description: 'Ctrl + 鼠标悬停',
};

// 新增：创建默认API配置项
function createDefaultApiConfigItem(): ApiConfigItem {
  const now = Date.now();
  return {
    id: 'default-config',
    name: '默认配置',
    provider: 'OpenAI',
    config: DEFAULT_API_CONFIG,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };
}

// =================================================================
// Section: 智能阅读增强系统 (Smart Reading Enhancement System)
// =================================================================
/**
 * 用户自定义增强器配置
 */
export interface CustomProviderConfig {
  id: string;
  name: string;
  description: string;
  // 触发条件：基于CSS选择器和关键词
  trigger: {
    cssSelector: string;
    keywords?: string[];
  };
  // AI提示词模板
  promptTemplate: string;
  // UI显示模板
  uiTemplate: string;
}

/**
 * 智能阅读增强系统设置
 */
export interface EnhancementSettings {
  // 全局开关
  isEnhancementEnabled: boolean;

  // 启用的增强功能分类列表
  enabledCategories: EnhancementCategory[];

  // 增强功能触发频率 (0.1-1.0)
  frequency: number;

  // 每页最大增强数量
  maxEnhancementsPerPage: number;

  // AI服务提供商
  aiService: string;

  // 用户自定义的增强器配置
  customProviders: CustomProviderConfig[];

  // AI调用预算和频率限制
  apiLimits: {
    dailyCallLimit: number;
    requestsPerMinute: number;
  };
}

// EnhancementCategory类型定义在enhancements/core/types.ts中
type EnhancementCategory =
  | 'writing'
  | 'thinking'
  | 'creativity'
  | 'vocabulary'
  | 'communication'
  | 'verification'
  | 'knowledge'
  | 'data'
  | 'time'
  | 'decision';

// 默认增强系统配置
export const DEFAULT_ENHANCEMENT_SETTINGS: EnhancementSettings = {
  isEnhancementEnabled: false, // 默认关闭，引导用户开启
  enabledCategories: ['writing', 'creativity', 'thinking'], // 默认开启几个核心功能
  frequency: 0.3, // 30%的触发频率
  maxEnhancementsPerPage: 5,
  aiService: 'openai', // 默认使用OpenAI
  customProviders: [],
  apiLimits: {
    dailyCallLimit: 50, // 免费用户每日限制
    requestsPerMinute: 5,
  },
};

export const DEFAULT_SETTINGS: UserSettings = {
  isEnabled: true,
  userLevel: UserLevel.INTERMEDIATE,
  replacementRate: 10,
  useGptApi: true,
  apiConfigs: [createDefaultApiConfigItem()],
  activeApiConfigId: 'default-config',
  translationStyle: TranslationStyle.DEFAULT,
  triggerMode: TriggerMode.AUTOMATIC,
  maxLength: 400,
  translationDirection: 'auto',
  originalWordDisplayMode: OriginalWordDisplayMode.LEARNING,
  enablePronunciationTooltip: true,
  multilingualConfig: DEFAULT_MULTILINGUAL_CONFIG,
  pronunciationHotkey: {
    enabled: true,
    requireModifier: true,
    modifierKeys: ['ctrl'],
  },
  floatingBall: DEFAULT_FLOATING_BALL_CONFIG,
  translationPosition: TranslationPosition.AFTER,
  showParentheses: true,
  apiRequestTimeout: 30000,
  // 新增：默认增强系统配置
  enhancementSettings: DEFAULT_ENHANCEMENT_SETTINGS,
};
