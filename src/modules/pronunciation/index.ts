/**
 * Pronunciation 模块主入口
 * 提供统一的API接口
 */

// 核心服务
export { PronunciationService } from './services/PronunciationService';
export { TTSService } from './services/TTSService';

// 配置
export * from './config';

// 类型定义
export * from './types';

// 提供者 (避免类型重复导出)
export {
  IPhoneticProvider,
  DictionaryApiProvider,
  PhoneticProviderFactory,
  ITTSProvider,
  WebSpeechTTSProvider,
  YoudaoTTSProvider,
  TTSProviderFactory,
} from './providers';

// 工具类
export * from './utils';

// UI组件
export * from './ui';

// 默认导出主服务
export { PronunciationService as default } from './services/PronunciationService';
