import { UserLevel } from './types';
import { getLanguageNames } from './languageManager';

/**
 * 根据用户的设置，动态生成最优的系统提示词
 * @param direction 翻译方向 (例如 'zh-to-en')
 * @param level 用户的英语水平
 * @param replacementRate 替换比例
 * @returns 优化后的系统提示词字符串
 */
export function getSystemPrompt(
  direction: string,
  level: UserLevel,
  replacementRate: number,
): string {
  // 基础指令：定义了AI的核心角色和任务
  const baseInstruction =
    "You are an expert in linguistics and a language teacher. Your task is to process a given text paragraph, identify words or phrases suitable for a user's learning level, and provide translations.";

  // 响应格式要求：确保AI返回我们需要的JSON结构
  const responseFormat = `You MUST respond with a JSON object containing a single key "replacements", which is an array of objects. Each object in the array must have two keys: "original" (the word or phrase from the source text) and "translation" (the translated version of that word or phrase).
Example for zh-to-en: {"replacements": [{"original": "你好", "translation": "Hello"}]}
Example for en-to-zh: {"replacements": [{"original": "Hello", "translation": "你好"}]}`;

  // 根据翻译方向调整核心任务指令
  let taskInstruction: string;
  const langNames = getLanguageNames(direction);

  if (direction === 'auto') {
    taskInstruction = `The user is a native Chinese speaker learning other languages. You will be provided with a text. First, detect if the text is primarily Chinese or English.
- If the text is Chinese, select key words or phrases and provide their ENGLISH translations.
- If the text is English, select key words or phrases and provide their CHINESE translations.
In the JSON response, the "original" key must contain the source word/phrase, and the "translation" key must contain its translation.`;
  } else if (langNames) {
    const userDescription =
      langNames.source === 'Chinese'
        ? `The user is a native Chinese speaker.`
        : `The user is a native Chinese speaker learning ${langNames.source}.`;
    taskInstruction = `${userDescription} The provided text is in ${langNames.source}. Your goal is to select key words or phrases and provide their ${langNames.target} translations. In the JSON response, the "original" key must contain the ${langNames.source} word/phrase, and the "translation" key must contain its ${langNames.target} translation.`;
  } else {
    taskInstruction = `The user is a native Chinese speaker. The provided text is in Chinese. Your goal is to select Chinese words or phrases and provide their ENGLISH translations to create a mixed-language learning environment. In the JSON response, the "original" key must contain the Chinese word/phrase, and the "translation" key must contain its English translation.`;
  }

  // 根据用户水平调整难度
  const difficultyAdjustment = `The user's English proficiency is at the ${
    UserLevel[level]
  } level. Please adjust the difficulty and frequency of the selected words accordingly.`;

  // 根据替换比例调整
  const rateAdjustment =
    replacementRate > 0 && replacementRate <= 1
      ? `This is a strict rule: you must translate a portion of the text that corresponds to ${Math.round(
          replacementRate * 100,
        )}% of the total character count. First, identify all words/phrases suitable for the user's level. Then, from that list, select a subset for translation ensuring the total character length of the *original* words/phrases is as close as possible to the target percentage. For example, for a 1000-character text and a 10% rate, the total length of the words you choose to translate should be very close to 100 characters.`
      : '';

  return `${baseInstruction}\n\n${taskInstruction}\n\n${difficultyAdjustment}\n\n${rateAdjustment}\n\n${responseFormat}`;
}
