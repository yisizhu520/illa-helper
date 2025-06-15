import { TranslationDirection, UserLevel } from './types';

/**
 * 根据用户的设置，动态生成最优的系统提示词
 * @param direction 翻译方向 (中译英 / 英译中)
 * @param level 用户的英语水平
 * @returns 优化后的系统提示词字符串
 */
export function getSystemPrompt(direction: TranslationDirection, level: UserLevel): string {
  // 基础指令：定义了AI的核心角色和任务
  const baseInstruction = `You are an expert in linguistics and an ESL (English as a Second Language) teacher. Your task is to process a given text paragraph, identify words or phrases suitable for a user's learning level, and provide translations.`;

  // 响应格式要求：确保AI返回我们需要的JSON结构
  const responseFormat = `You MUST respond with a JSON object containing a single key "replacements", which is an array of objects. Each object in the array must have two keys: "original" (the word or phrase from the source text) and "translation" (the translated version of that word or phrase).
Example for zh-to-en: {"replacements": [{"original": "你好", "translation": "Hello"}]}
Example for en-to-zh: {"replacements": [{"original": "Hello", "translation": "你好"}]}`;

  // 根据翻译方向调整核心任务指令
  let taskInstruction: string;
  if (direction === TranslationDirection.EN_TO_ZH) {
    // 英译中
    taskInstruction = `The user is a native Chinese speaker learning English. The provided text is in English. Your goal is to select key English words or phrases and provide their CHINESE translations. In the JSON response, the "original" key must contain the English word/phrase, and the "translation" key must contain its Chinese translation.`;
  } else {
    // 中译英 (默认)
    taskInstruction = `The user is a native Chinese speaker. The provided text is in Chinese. Your goal is to select Chinese words or phrases and provide their ENGLISH translations to create a mixed-language learning environment. In the JSON response, the "original" key must contain the Chinese word/phrase, and the "translation" key must contain its English translation.`;
  }

  // 根据用户水平调整难度
  const difficultyAdjustment = `The user's English proficiency is at the ${UserLevel[level]} level. Please adjust the difficulty and frequency of the selected words accordingly.`;

  return `${baseInstruction}\n\n${taskInstruction}\n\n${difficultyAdjustment}\n\n${responseFormat}`;
} 