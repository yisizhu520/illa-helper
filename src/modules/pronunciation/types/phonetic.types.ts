/**
 * 音标相关类型定义
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

// 缓存条目
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
