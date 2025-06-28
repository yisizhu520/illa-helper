/**
 * Google Gemini 和 Proxy Gemini 测试
 */

import { UniversalApiService } from '../services/UniversalApiService';

export async function testGeminiProviders() {
  const universalApi = UniversalApiService.getInstance();

  console.log('=== Google Gemini 和 Proxy Gemini 测试 ===');

  // 测试 1: Google Gemini 直接调用
  console.log('\n1. 测试 Google Gemini (直接调用):');
  try {
    const result1 = await universalApi.call('Hello, how are you?', {
      forceProvider: 'GoogleGemini' as any,
      systemPrompt: 'Please respond in Chinese.',
      temperature: 0.7,
      maxTokens: 100
    });

    console.log('结果:', {
      success: result1.success,
      content: result1.content,
      provider: result1.provider,
      model: result1.model,
      usage: result1.usage,
      error: result1.error
    });
  } catch (error) {
    console.error('Google Gemini 测试失败:', error);
  }

  // 测试 2: Proxy Gemini 调用
  console.log('\n2. 测试 Proxy Gemini:');
  try {
    const result2 = await universalApi.call('Translate this to Chinese: Beautiful day', {
      forceProvider: 'ProxyGemini' as any,
      temperature: 0.5,
      maxTokens: 50
    });

    console.log('结果:', {
      success: result2.success,
      content: result2.content,
      provider: result2.provider,
      model: result2.model,
      usage: result2.usage,
      error: result2.error
    });
  } catch (error) {
    console.error('Proxy Gemini 测试失败:', error);
  }

  // 测试 3: 检查可用性
  console.log('\n3. 检查各Provider可用性:');
  try {
    const models = await universalApi.getAvailableModels();
    console.log('可用模型:', models);

    const isAvailable = await universalApi.isAvailable();
    console.log('服务可用性:', isAvailable);
  } catch (error) {
    console.error('可用性检查失败:', error);
  }

  console.log('\n=== 测试完成 ===');
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  testGeminiProviders().catch(console.error);
}
