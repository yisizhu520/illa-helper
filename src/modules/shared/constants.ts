/**
 * 共享常量定义
 * 用于统一管理跨模块使用的常量
 */

// 需要忽略的HTML标签（大写）
export const IGNORE_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'META',
  'LINK',
  'IFRAME',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'CODE',
  'NAV',
  'FOOTER',
  'PRE',
  'IMG',
  'IMAGE',
  'TIME',
  'NOSCRIPT',
  'HEADER',
  'BANNER',
  'COPYRIGHT',
  'TITLE',
  'BUTTON',
  'FORM',
  'SVG',
  'CANVAS',
  'VIDEO',
  'AUDIO',
]);

// CSS选择器格式的忽略元素（小写）
export const IGNORE_SELECTORS = [
  //把IGNORE_TAGS加入
  ...IGNORE_TAGS,
  // 基础HTML元素
  'script',
  'style',
  'meta',
  'link',
  'noscript',
  'title',
  'input',
  'textarea',
  'select',
  'button',
  'form',
  'img',
  'svg',
  'canvas',
  'video',
  'audio',
  'iframe',

  // 属性选择器
  '[contenteditable="false"]',
  '[aria-hidden="true"]',

  // 翻译工具相关的类和属性
  '.wxt-translation-term',
  '.wxt-original-word',
  '.wxt-pronunciation-tooltip',
  '[data-wxt-text-processed]',
  '[data-wxt-word-processed]',

  // 代码高亮相关
  '.code',
  '.highlight',
  '.hljs',
].join(', ');

// 块级元素标签
export const BLOCK_TAGS = new Set([
  'DIV',
  'P',
  'SECTION',
  'ARTICLE',
  'MAIN',
  'ASIDE',
  'HEADER',
  'FOOTER',
  'NAV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BLOCKQUOTE',
  'PRE',
  'LI',
  'TD',
  'TH',
  'FIGCAPTION',
  'DETAILS',
  'SUMMARY',
  'ADDRESS',
  'HGROUP',
]);
