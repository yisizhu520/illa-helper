/**
 * 提供者模块统一导出
 */

// 音标提供者
export * from './phonetic';

// TTS提供者
export * from './tts';

// 便捷导入
export {
  IPhoneticProvider,
  DictionaryApiProvider,
  PhoneticProviderFactory
} from './phonetic';

export {
  ITTSProvider,
  WebSpeechTTSProvider,
  YoudaoTTSProvider,
  TTSProviderFactory
} from './tts';
