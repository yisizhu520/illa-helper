/**
 * 发音模块提供者导出
 */

// 音标提供者
export { DictionaryApiProvider } from './DictionaryApiProvider';
export { PhoneticProviderFactory } from './PhoneticProviderFactory';

// TTS提供者
export { WebSpeechTTSProvider } from './WebSpeechTTSProvider';
export { YoudaoTTSProvider } from './YoudaoTTSProvider';
export { TTSProviderFactory } from './TTSProviderFactory';

// 词义提供者
export { AITranslationProvider } from './AITranslationProvider';

// 子模块导出
export * from './phonetic';
export * from './tts';
