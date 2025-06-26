/**
 * UserLevel 工具类
 * 提供 UserLevel 相关的工具函数
 */

import { UserLevel, USER_LEVEL_OPTIONS, ApiConfig } from '@/src/modules/types';

/**
 * 获取 UserLevel 的中文显示名称
 * @param level UserLevel 枚举值
 * @returns 中文显示名称
 */
export function getUserLevelLabel(level: UserLevel): string {
  const option = USER_LEVEL_OPTIONS.find((opt) => opt.value === level);
  return option?.label || '未知';
}

/**
 * 获取所有 UserLevel 选项，用于下拉框等组件
 * @returns UserLevel 选项数组
 */
export function getUserLevelOptions() {
  return USER_LEVEL_OPTIONS;
}

/**
 * API测试结果接口
 */
export interface ApiTestResult {
  success: boolean;
  message?: string;
  model?: string;
}

/**
 * 测试API连接
 * @param apiConfig API配置对象
 * @returns Promise<ApiTestResult> 测试结果
 */
export async function testApiConnection(apiConfig: ApiConfig): Promise<ApiTestResult> {
  if (!apiConfig.apiKey || !apiConfig.apiEndpoint) {
    throw new Error('API密钥或端点未配置');
  }

  try {
    const response = await fetch(apiConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        temperature: apiConfig.temperature,
        enable_thinking: apiConfig.enable_thinking,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test. Please respond with "OK".'
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      return {
        success: true,
        message: `状态码: ${response.status}`,
        model: data.model || apiConfig.model
      };
    } else {
      const errorData = await response.json().catch(() => null);
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '网络连接错误'
    };
  }
}

/**
 * 清理AI响应中的Markdown格式
 * @param content AI返回的原始内容
 * @returns 清理后的JSON字符串
 */
export function cleanMarkdownFromResponse(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // 移除Markdown代码块标记
  let cleaned = content.trim();

  // 移除开头的```json或```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');

  // 移除结尾的```
  cleaned = cleaned.replace(/\n?\s*```\s*$/i, '');

  // 移除其他可能的Markdown格式
  cleaned = cleaned.replace(/^\s*```[\s\S]*?\n/, ''); // 移除开头的代码块
  cleaned = cleaned.replace(/\n```\s*$/, ''); // 移除结尾的代码块

  // 移除可能的额外空白字符
  cleaned = cleaned.trim();

  return cleaned;
}
