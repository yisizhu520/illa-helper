/**
 * UserLevel 工具类
 * 提供 UserLevel 相关的工具函数
 */

import { UserLevel, USER_LEVEL_OPTIONS } from '@/src/modules/types';

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
