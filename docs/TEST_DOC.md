# 浸入式语言助手 - 使用指南与测试文档

## 📋 目录

- [UniversalApiService 通用AI服务](#universalapiservice-通用ai服务)
- [API参考与使用示例](#api参考与使用示例)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [故障排除](#故障排除)
- [性能优化建议](#性能优化建议)

---

## 🚀 UniversalApiService 通用AI服务

### 概述

`UniversalApiService` 是一个通用的大模型API调用服务，它封装了底层的API调用逻辑，提供简单易用的接口，让您可以轻松地在任何业务场景中使用AI大模型。

### 核心特性

- 🚀 **极简使用**: 一行代码即可调用AI
- 🔄 **统一接口**: 支持多种Provider（OpenAI、Google Gemini等）
- ⚙️ **灵活配置**: 支持自定义参数和配置
- 🛡️ **错误处理**: 完善的错误处理机制
- 💬 **聊天对话**: 支持多轮对话
- 📊 **Token统计**: 提供详细的使用统计

### 快速开始

#### 基础导入

```typescript
import { callAI, quickAI, universalApi } from '@/src/modules/api';
```

#### 1. 最简单的调用

```typescript
// 直接调用，使用默认配置
const result = await callAI('解释什么是人工智能');
console.log(result.content);
```

#### 2. 快速调用（带系统提示词）

```typescript
const result = await quickAI(
  '分析这段文本的情感倾向',
  '你是一个专业的情感分析师'
);
console.log(result.content);
```

#### 3. 带配置的调用

```typescript
const result = await callAI('写一首关于春天的诗', {
  systemPrompt: '你是一位诗人',
  temperature: 0.8,
  maxTokens: 500
});
```

### 详细用法

#### 使用类实例

```typescript
// 获取单例实例
const api = universalApi;

// 基本调用
const result = await api.call('你的提示词', {
  systemPrompt: '系统提示词',
  temperature: 0.7,
  maxTokens: 1000
});

// 聊天对话
const messages = [
  { role: 'system', content: '你是AI助手' },
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮助您的吗？' },
  { role: 'user', content: '请介绍一下TypeScript' }
];

const chatResult = await api.chat(messages, {
  temperature: 0.7
});
```

#### 配置选项详解

```typescript
interface UniversalApiOptions {
  systemPrompt?: string;        // 系统提示词
  temperature?: number;         // 模型温度 (0-2)
  maxTokens?: number;          // 最大输出Token数
  configId?: string;           // 指定API配置ID
  forceProvider?: TranslationProvider; // 强制使用特定Provider
  timeout?: number;            // 请求超时时间(毫秒)
  customParams?: string;       // 自定义参数JSON字符串
  rawResponse?: boolean;       // 是否返回原始响应
}
```

#### 返回结果详解

```typescript
interface UniversalApiResult {
  success: boolean;            // 是否成功
  prompt: string;             // 原始提示词
  content: string;            // AI生成的内容
  model?: string;             // 使用的模型名称
  provider?: string;          // 使用的Provider名称
  usage?: {                   // Token使用统计
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  rawData?: any;             // 原始响应数据
  error?: string;            // 错误信息
}
```

### 业务场景示例

#### 1. 文本分析

```typescript
const sentiment = await callAI(
  '请分析以下文本的情感倾向：这个产品太棒了！',
  {
    systemPrompt: '你是专业的文本情感分析师',
    temperature: 0.3
  }
);
```

#### 2. 内容生成

```typescript
const content = await callAI(
  '为智能手表写一段产品介绍',
  {
    systemPrompt: '你是专业的产品文案撰写师',
    temperature: 0.8,
    maxTokens: 500
  }
);
```

#### 3. 代码解释

```typescript
const explanation = await quickAI(
  `解释这段代码：\n${codeSnippet}`,
  '你是编程教师，用简单的语言解释代码'
);
```

#### 4. 邮件回复

```typescript
const reply = await callAI(
  `帮我回复这封邮件：\n${originalEmail}`,
  {
    systemPrompt: '你是专业的客服人员，回复要礼貌专业',
    temperature: 0.6
  }
);
```

#### 5. SEO标题生成

```typescript
const titles = await callAI(
  '为"提高工作效率"主题生成5个SEO友好的标题',
  {
    systemPrompt: '你是SEO专家，标题要吸引点击且包含关键词',
    temperature: 0.8
  }
);
```

#### 6. 数据分析建议

```typescript
const advice = await callAI(
  '我有100万条用户行为数据需要分析，给出处理建议',
  {
    systemPrompt: '你是数据分析专家',
    temperature: 0.5
  }
);
```

### 高级功能

#### 1. 指定特定Provider

```typescript
const result = await callAI('写一首诗', {
  forceProvider: TranslationProvider.GoogleGemini,
  temperature: 0.9
});

console.log(`使用的Provider: ${result.provider}`);
```

#### 2. 获取详细统计信息

```typescript
const result = await callAI('解释机器学习', {
  rawResponse: true
});

console.log(`Token使用量: ${result.usage?.totalTokens}`);
console.log(`原始响应:`, result.rawData);
```

#### 3. 多轮对话管理

```typescript
let conversation = [
  { role: 'system', content: '你是编程助手' }
];

// 第一轮
conversation.push({ role: 'user', content: '什么是React Hooks?' });
let result = await universalApi.chat(conversation);
conversation.push({ role: 'assistant', content: result.content });

// 第二轮
conversation.push({ role: 'user', content: '举个useState的例子' });
result = await universalApi.chat(conversation);
```

#### 4. 错误处理

```typescript
const result = await callAI('你的提示词');

if (!result.success) {
  console.error('调用失败:', result.error);
  // 处理错误逻辑
  return;
}

// 成功处理
console.log(result.content);
```

#### 5. 检查API状态

```typescript
// 检查API是否可用
const isAvailable = await universalApi.isAvailable();

// 获取可用的模型列表
const models = await universalApi.getAvailableModels();
console.log('可用模型:', models);
```

### 最佳实践

#### 1. 温度设置建议

- **创意任务** (诗歌、故事): `temperature: 0.8-1.0`
- **分析任务** (数据分析、情感分析): `temperature: 0.2-0.5`
- **问答任务** (解释、教学): `temperature: 0.5-0.7`
- **代码相关** (代码解释、重构): `temperature: 0.3-0.6`

#### 2. 系统提示词优化

```typescript
// ✅ 好的系统提示词
const goodPrompt = '你是一名资深的前端开发工程师，擅长React和TypeScript，请用简洁专业的语言回答问题。';

// ❌ 不够具体的提示词
const badPrompt = '你是程序员';
```

#### 3. 错误处理模式

```typescript
async function safeCallAI(prompt: string, options?: UniversalApiOptions) {
  try {
    const result = await callAI(prompt, options);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.content;
  } catch (error) {
    console.error('AI调用失败:', error);
    return '抱歉，处理您的请求时出现了错误，请稍后重试。';
  }
}
```

#### 4. 性能优化

```typescript
// 对于不需要详细信息的简单调用
const result = await quickAI(prompt, systemPrompt);

// 对于需要控制的复杂调用
const result = await callAI(prompt, {
  systemPrompt,
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000
});
```

### 与翻译API的区别

| 特性 | UniversalApiService | 翻译API |
|------|---------------------|---------|
| 用途 | 通用AI调用 | 专门用于翻译 |
| 系统提示词 | 完全自定义 | 固定的翻译提示词 |
| 返回格式 | 原始AI响应 | 结构化翻译结果 |
| 业务场景 | 任意AI任务 | 文本翻译替换 |

---

## 🔌 API参考与使用示例

### API服务使用（重构后模块化架构）

#### 导入和创建翻译服务
```typescript
// 推荐：使用新的模块化API
import { ApiServiceFactory } from '@/src/modules/api';

// 创建翻译提供者实例
const provider = ApiServiceFactory.createProvider(activeConfig);

// 进行文本翻译
const result = await provider.analyzeFullText(text, settings);
```

#### 直接使用特定Provider
```typescript
// 直接导入特定Provider
import { GoogleGeminiProvider, OpenAIProvider } from '@/src/modules/api';

// 直接创建Gemini Provider
const geminiProvider = new GoogleGeminiProvider(config);
const result = await geminiProvider.analyzeFullText(text, settings);

// 直接创建OpenAI Provider  
const openaiProvider = new OpenAIProvider(config);
const result = await openaiProvider.analyzeFullText(text, settings);
```

#### 扩展新的翻译Provider
```typescript
import { BaseProvider } from '@/src/modules/api';
import { ApiConfig, UserSettings, FullTextAnalysisResponse } from '@/src/modules/types';

// 创建自定义Provider
class CustomProvider extends BaseProvider {
  protected getProviderName(): string {
    return 'Custom Provider';
  }

  protected async doAnalyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse> {
    // 实现自定义翻译逻辑
    return {
      original: text,
      processed: '',
      replacements: []
    };
  }
}

// 在工厂中使用
// 需要在 ApiServiceFactory 中添加对应的创建逻辑
```

### 用户设置API

#### 获取用户设置
```typescript
import { StorageManager } from '@/src/modules/storageManager';

const storageManager = new StorageManager();
const settings = await storageManager.getUserSettings();
```

#### 保存用户设置
```typescript
import { UserLevel, TranslationStyle } from '@/src/modules/types';

await storageManager.saveUserSettings({
  userLevel: UserLevel.INTERMEDIATE,
  replacementRate: 0.3,
  translationStyle: TranslationStyle.HIGHLIGHTED
});
```

#### 设置更新通知
```typescript
import { notifySettingsChanged } from '@/src/modules/messaging';

await notifySettingsChanged(newSettings);
```

### 发音服务API

#### 初始化发音服务
```typescript
import { PronunciationService, DEFAULT_PRONUNCIATION_CONFIG } from '@/src/modules/pronunciation';

const pronunciationService = new PronunciationService({
  ...DEFAULT_PRONUNCIATION_CONFIG,
  uiConfig: {
    tooltipEnabled: true,
    showPhonetic: true,
    showPlayButton: true
  }
});
```

#### 为元素添加发音功能
```typescript
await pronunciationService.addPronunciationToElement(
  element,           // HTML元素
  'hello world',     // 单词或短语
  false             // 是否为短语
);
```

#### 语音合成
```typescript
// 使用默认TTS
const result = await pronunciationService.speakText('Hello World');

// 指定口音
const result = await pronunciationService.speakTextWithAccent('Hello', 'en-GB');
```

#### 获取音标
```typescript
const phoneticResult = await pronunciationService.getPhonetic('hello');
console.log(phoneticResult.phonetics[0].text); // "/həˈloʊ/"
```

### 工具函数API

#### API相关工具函数
```typescript
import { 
  mergeCustomParams, 
  createErrorResponse, 
  validateInputs 
} from '@/src/modules/api';

// 合并自定义API参数
const mergedParams = mergeCustomParams(baseParams, '{"temperature": 0.5}');

// 创建错误响应
const errorResponse = createErrorResponse('原始文本');

// 验证输入参数
const isValid = validateInputs('文本内容', 'api-key');
```

#### 文本处理工具函数
```typescript
import { addPositionsToReplacements } from '@/src/modules/api';

// 为替换项添加位置信息
const replacementsWithPosition = addPositionsToReplacements(
  originalText,
  [{ original: 'hello', translation: '你好' }]
);
```

---

## 🧪 测试指南

### UniversalApiService 测试

#### 运行完整测试套件

```typescript
import { UniversalApiTest, quickFunctionTest } from '@/src/modules/api/examples/UniversalApiTest';

// 运行所有测试
await UniversalApiTest.runAllTests();

// 快速功能验证
await quickFunctionTest();
```

#### 测试覆盖内容

- ✅ 基本调用功能
- ✅ Google Gemini Provider测试
- ✅ OpenAI Provider测试
- ✅ 聊天对话功能
- ✅ 原始响应获取
- ✅ 错误处理验证
- ✅ API可用性检查
- ✅ 模型列表获取

#### 单独测试示例

```typescript
// 测试基本调用
const basicResult = await UniversalApiTest.testBasicCall();

// 测试特定Provider
const geminiResult = await UniversalApiTest.testGoogleGeminiProvider();

// 测试错误处理
const errorTest = await UniversalApiTest.testErrorHandling();
```

### 手动测试检查清单

#### 核心功能测试
- [ ] 基本翻译功能在不同类型网站上工作正常
- [ ] 智能语言检测功能正确识别网页源语言
- [ ] 智能多语言模式翻译准确（测试中英日韩等语言）
- [ ] AI通用调用功能正常（各种业务场景）

#### 发音系统测试
- [ ] 发音功能音标显示正确（Dictionary API）
- [ ] TTS语音播放正常（测试有道TTS + Web Speech双TTS）
- [ ] 悬浮框定位和交互响应正确（避免边界溢出）
- [ ] 双层学习体验正常（短语→单词交互）

#### 界面和样式测试
- [ ] 7种翻译样式显示正常（含学习模式模糊效果）
- [ ] 主题适配正常（深色/浅色自动切换）
- [ ] 响应式设计在不同设备上正常
- [ ] UniversalApiService界面调用正常

#### 设置和配置测试
- [ ] 设置保存和跨设备同步功能正常
- [ ] 20+种语言翻译方向正确
- [ ] API配置切换正常
- [ ] 自定义参数配置生效

#### 性能和稳定性测试
- [ ] 性能表现良好（大页面、动态内容、缓存机制）
- [ ] 内存使用合理（长时间使用不泄漏）
- [ ] 错误恢复机制正常
- [ ] 网络异常处理正常

---

## 🐛 调试技巧

### 基础调试设置

#### 启用调试模式
```typescript
// 启用调试日志
localStorage.setItem('wxt-debug', 'true');

// 查看详细控制台输出
console.log('Debug mode enabled');
```

#### 检查API配置
```typescript
// 检查当前API配置
const settings = await browser.storage.sync.get('user_settings');
console.log('Current settings:', JSON.parse(settings.user_settings));

// 验证API配置有效性
const isAvailable = await universalApi.isAvailable();
console.log('API Available:', isAvailable);

// 获取模型列表
const models = await universalApi.getAvailableModels();
console.log('Available models:', models);
```

#### UniversalApiService调试

```typescript
// 测试基本调用
const debugResult = await callAI('测试调用', {
  rawResponse: true,
  systemPrompt: '简短回答'
});

console.log('Debug result:', {
  success: debugResult.success,
  provider: debugResult.provider,
  model: debugResult.model,
  usage: debugResult.usage,
  error: debugResult.error,
  rawData: debugResult.rawData
});
```

### 发音系统调试

#### 检查发音服务状态
```typescript
// 检查TTS服务状态
const ttsStatus = pronunciationService.getTTSProviderStatus();
console.log('TTS Status:', ttsStatus);

// 检查浏览器TTS支持
if ('speechSynthesis' in window) {
  console.log('Web Speech API supported');
  console.log('Available voices:', speechSynthesis.getVoices());
} else {
  console.warn('Web Speech API not supported');
}

// 检查缓存状态
console.log('Pronunciation cache status:', pronunciationService.getCacheStatus());
```

#### 音标获取调试
```typescript
// 测试音标获取
try {
  const phoneticResult = await pronunciationService.getPhonetic('hello');
  console.log('Phonetic result:', phoneticResult);
} catch (error) {
  console.error('Phonetic fetch failed:', error);
}
```

### 网络请求调试

#### API请求监控
```typescript
// 监控API请求
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('API Request:', args[0], args[1]);
  const response = await originalFetch(...args);
  console.log('API Response:', response.status, response.statusText);
  return response;
};
```

#### 请求性能分析
```typescript
// 测试请求性能
const startTime = performance.now();
const result = await callAI('性能测试');
const endTime = performance.now();
console.log(`Request took ${endTime - startTime} milliseconds`);
```

### 内存和性能调试

#### 内存使用监控
```typescript
// 检查内存使用
if (performance.memory) {
  console.log('Memory usage:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
  });
}
```

#### 性能指标监控
```typescript
// 监控关键性能指标
const performanceMetrics = {
  translationTime: 0,
  tooltipResponseTime: 0,
  apiCallSuccessRate: 0,
  cacheHitRate: 0
};

// 在关键操作前后测量时间
const measurePerformance = async (operation: string, fn: Function) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`${operation} took ${duration.toFixed(2)}ms`);
  return result;
};
```

---

## 🛠️ 故障排除

### 常见问题与解决方案

#### 1. UniversalApiService相关问题

**症状**: AI调用失败，返回错误信息
**排查步骤**:
```typescript
// 1. 检查API可用性
const isAvailable = await universalApi.isAvailable();
console.log('API可用性:', isAvailable);

// 2. 检查模型列表
const models = await universalApi.getAvailableModels();
console.log('可用模型:', models);

// 3. 测试简单调用
const testResult = await callAI('Hello', { 
  rawResponse: true,
  timeout: 10000 
});
console.log('测试结果:', testResult);
```

**常见解决方案**:
- 检查API密钥是否正确配置
- 验证网络连接是否正常
- 确认选择的模型是否可用
- 检查请求参数是否合法

#### 2. API配置问题

**症状**: 翻译功能不工作，显示API配置错误通知
**解决方案**:
```typescript
// 检查API配置
const settings = await browser.storage.sync.get('user_settings');
const userSettings = JSON.parse(settings.user_settings);
console.log('API Config:', userSettings.apiConfigs);

// 验证API密钥格式
const activeConfig = userSettings.apiConfigs.find(
  config => config.id === userSettings.activeApiConfigId
);

if (!activeConfig?.config?.apiKey) {
  console.error('API密钥未配置');
} else if (activeConfig.provider === 'OpenAI' && 
           !activeConfig.config.apiKey.startsWith('sk-')) {
  console.error('OpenAI API密钥格式不正确');
}
```

#### 3. 发音功能无法使用

**症状**: 悬浮框显示但音标或TTS不工作
**解决方案**:
```typescript
// 检查TTS服务状态
const ttsStatus = pronunciationService.getTTSProviderStatus();
console.log('TTS Status:', ttsStatus);

// 检查浏览器TTS支持
if ('speechSynthesis' in window) {
  console.log('Web Speech API supported');
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices.length);
} else {
  console.warn('Web Speech API not supported');
}

// 检查Dictionary API连接
try {
  const testPhonetic = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/test');
  if (testPhonetic.ok) {
    console.log('Dictionary API accessible');
  }
} catch (error) {
  console.error('Dictionary API not accessible:', error);
}
```

#### 4. 样式显示异常

**症状**: 翻译文本样式不正确或冲突
**解决方案**:
```typescript
// 检查样式注入
const styleSheets = document.querySelectorAll('style[data-wxt]');
console.log('WXT stylesheets:', styleSheets.length);

// 检查样式冲突
const conflictingStyles = document.querySelectorAll('[class*="wxt-"]');
console.log('WXT styled elements:', conflictingStyles.length);

// 重新注入样式
if (styleSheets.length === 0) {
  console.log('样式未正确注入，尝试重新初始化');
  // 重新初始化样式管理器
}
```

#### 5. 设置保存失败

**症状**: 配置更改后不生效或丢失
**解决方案**:
```typescript
// 检查存储权限
try {
  await browser.storage.sync.set({test: 'value'});
  await browser.storage.sync.remove('test');
  console.log('Storage permissions OK');
} catch (error) {
  console.error('Storage permission denied:', error);
}

// 检查存储配额
const storageData = await browser.storage.sync.get(null);
const dataSize = JSON.stringify(storageData).length;
console.log('Storage usage:', dataSize, 'bytes');

if (dataSize > 102400) { // 100KB limit for sync storage
  console.warn('Storage quota exceeded');
}
```

#### 6. 性能问题

**症状**: 页面响应慢，内存使用过高
**解决方案**:
```typescript
// 检查内存使用
const checkMemory = () => {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('Memory usage:', {
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
    });
  }
};

// 检查缓存状态
const cacheStats = pronunciationService.getCacheStatus();
console.log('Cache statistics:', cacheStats);

// 清理缓存
if (cacheStats.size > 1000) {
  pronunciationService.clearCache();
  console.log('Cache cleared due to size limit');
}
```

#### 7. 网络连接问题

**症状**: API调用超时或连接失败
**解决方案**:
```typescript
// 测试网络连接
const testConnection = async () => {
  try {
    // 测试基本网络连接
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('网络连接正常');
    }
  } catch (error) {
    console.error('网络连接异常:', error);
  }
};

// 测试API端点连接
const testApiEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'test' }),
      timeout: 10000
    });
    
    console.log(`API端点 ${endpoint} 状态:`, response.status);
  } catch (error) {
    console.error(`API端点 ${endpoint} 连接失败:`, error);
  }
};
```

### 错误代码参考

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `API_KEY_MISSING` | API密钥未配置 | 在设置中配置有效的API密钥 |
| `API_KEY_INVALID` | API密钥无效 | 检查密钥格式和有效性 |
| `NETWORK_ERROR` | 网络连接失败 | 检查网络连接和防火墙设置 |
| `TIMEOUT_ERROR` | 请求超时 | 增加超时时间或检查网络 |
| `QUOTA_EXCEEDED` | API配额超限 | 检查API使用量和账单 |
| `MODEL_NOT_FOUND` | 模型不存在 | 检查模型名称是否正确 |
| `INVALID_REQUEST` | 请求参数无效 | 检查请求参数格式 |

---

## ⚡ 性能优化建议

### UniversalApiService性能优化

#### 1. 请求优化

```typescript
// 使用合适的温度设置
const optimizedCall = await callAI(prompt, {
  temperature: 0.3,    // 分析任务使用较低温度
  maxTokens: 500,      // 限制输出长度
  timeout: 15000       // 设置合理超时
});

// 批量处理多个请求
const batchRequests = await Promise.allSettled([
  callAI(prompt1, options1),
  callAI(prompt2, options2),
  callAI(prompt3, options3)
]);
```

#### 2. 缓存策略

```typescript
// 实现请求缓存
const cache = new Map();

const cachedCallAI = async (prompt: string, options: UniversalApiOptions) => {
  const cacheKey = JSON.stringify({ prompt, options });
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await callAI(prompt, options);
  cache.set(cacheKey, result);
  
  return result;
};
```

### 翻译系统性能优化

#### 1. DOM操作优化
```typescript
// 批量DOM更新
const fragment = document.createDocumentFragment();
// 添加所有元素到fragment
element.appendChild(fragment);

// 使用Range API精确替换
const range = document.createRange();
range.setStart(textNode, startOffset);
range.setEnd(textNode, endOffset);
```

#### 2. 异步处理优化
```typescript
// 并行加载音标和词义
const [phoneticResult, aiTranslation] = await Promise.allSettled([
  pronunciationService.getPhonetic(word),
  universalApi.call(`解释单词"${word}"的含义`, {
    systemPrompt: '你是英语词典，用简洁的中文解释英语单词',
    maxTokens: 100
  })
]);
```