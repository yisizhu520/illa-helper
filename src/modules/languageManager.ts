export interface Language {
  code: string; // e.g., 'en', 'zh', 'ja'
  name: string; // e.g., 'English', 'Chinese', 'Japanese'
  nativeName: string; // e.g., 'English', '中文', '日本語'
}

export const LANGUAGES: { [key: string]: Language } = {
  en: { code: 'en', name: 'English', nativeName: '英语' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日语' },
  ko: { code: 'ko', name: 'Korean', nativeName: '韩语' },
  fr: { code: 'fr', name: 'French', nativeName: '法语' },
  de: { code: 'de', name: 'German', nativeName: '德语' },
  es: { code: 'es', name: 'Spanish', nativeName: '西班牙语' },
  ru: { code: 'ru', name: 'Russian', nativeName: '俄语' },
  hi: { code: 'hi', name: 'Hindi', nativeName: '印地语' }
};

export function getTranslationDirectionOptions() {
  const options = [
    { value: 'auto', label: '自动检测网站语言' },
    { value: 'zh-to-en', label: '中译英文' },
    { value: 'en-to-zh', label: '英译中文' },
  ];

  for (const langCode in LANGUAGES) {
    if (langCode !== 'zh' && langCode !== 'en') {
      const language = LANGUAGES[langCode];
      options.push({
        value: `zh-to-${langCode}`,
        label: `中文译${language.nativeName}`,
      });
    }
  }

  return options;
}

export function getLanguageNames(
  direction: string,
): { source: string; target: string } | null {
  if (direction === 'auto') {
    return null;
  }
  const parts = direction.split('-to-');
  if (parts.length !== 2) return null;

  const sourceLang = LANGUAGES[parts[0]];
  const targetLang = LANGUAGES[parts[1]];

  if (!sourceLang || !targetLang) return null;

  return {
    source: sourceLang.name,
    target: targetLang.name,
  };
}
