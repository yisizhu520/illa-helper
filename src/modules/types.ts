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

// This interface is now closely aligned with UserSettings, consider merging or simplifying in future.
export interface ReplacementConfig {
  userLevel: UserLevel;
  replacementRate: number;
  useGptApi: boolean;
  apiConfig: ApiConfig;
  inlineTranslation: boolean;
  translationStyle: TranslationStyle;
  translationDirection: TranslationDirection;
}

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

export enum TranslationDirection {
  AUTO = 'auto',
  ZH_TO_EN = 'zh-to-en',
  EN_TO_ZH = 'en-to-zh',
}

export enum OriginalWordDisplayMode {
  VISIBLE,
  LEARNING,
  HIDDEN,
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
  translationDirection: TranslationDirection;
  originalWordDisplayMode: OriginalWordDisplayMode;
}

export const DEFAULT_SETTINGS: UserSettings = {
  userLevel: UserLevel.BEGINNER,
  replacementRate: 0.2,
  isEnabled: true,
  useGptApi: true,
  apiConfig: DEFAULT_API_CONFIG,
  translationStyle: TranslationStyle.DEFAULT,
  triggerMode: TriggerMode.MANUAL,
  maxLength: 400,
  translationDirection: TranslationDirection.AUTO,
  originalWordDisplayMode: OriginalWordDisplayMode.LEARNING,
};
