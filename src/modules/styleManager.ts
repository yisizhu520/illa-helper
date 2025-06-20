/**
 * 样式管理模块
 * 负责管理翻译文本的样式
 */

// 翻译文本样式

import { TranslationStyle } from './types';
// 样式管理器
export class StyleManager {
  private currentStyle: TranslationStyle;

  constructor() {
    this.currentStyle = TranslationStyle.DEFAULT;

    // 初始化样式
    this.initializeStyles();
  }

  /**
   * 设置翻译样式
   * @param style 样式类型
   */
  setTranslationStyle(style: TranslationStyle): void {
    this.currentStyle = style;
  }

  /**
   * 获取当前样式类名
   * @returns 样式类名
   */
  getCurrentStyleClass(): string {
    if (this.currentStyle === TranslationStyle.LEARNING) {
      return 'wxt-translation-term--learning';
    }
    return `wxt-style-${this.currentStyle}`;
  }

  /**
   * 初始化样式
   * 在页面中注入CSS样式
   */
  private initializeStyles(): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --wxt-primary-color: #6a88e0;
        --wxt-accent-color: #ffafcc;
        --wxt-label-color: #546e7a;
      }

      /* 基础样式 */
      .wxt-word-container {
        display: inline;
        position: relative;
      }

      .wxt-chinese {
        display: inline;
      }

      .wxt-original-word {
        border-bottom: 1.5px dotted var(--wxt-primary-color);
        padding-bottom: 1px;
      }

      .wxt-english {
        display: inline;
        margin-left: 4px;
        font-size: 0.9em;
        vertical-align: baseline;
      }

      /* 默认样式 */
      .wxt-style-default {
        color: var(--wxt-primary-color);
        font-weight: 500;
      }

      /* 微妙样式 */
      .wxt-style-subtle {
        color: var(--wxt-label-color);
        opacity: 0.9;
      }

      /* 粗体样式 */
      .wxt-style-bold {
        color: var(--wxt-primary-color);
        font-weight: bold;
      }

      /* 斜体样式 */
      .wxt-style-italic {
        color: var(--wxt-primary-color);
        font-style: italic;
      }

      /* 下划线样式 */
      .wxt-style-underlined {
        color: var(--wxt-primary-color);
        text-decoration: none;
        padding-bottom: 1px;
        border-bottom: 2px solid var(--wxt-accent-color);
      }

      /* 高亮样式 */
      .wxt-style-highlighted {
        color: #212529;
        background-color: #ffeb3b;
        padding: 0 2px;
        border-radius: 2px;
      }

      /* 学习模式样式 */
      .wxt-translation-term--learning {
        filter: blur(5px);
        cursor: pointer;
        transition: filter 0.2s ease-in-out;
      }
      .wxt-translation-term--learning:hover {
        filter: blur(0);
      }

                  /* 发音功能样式 */
      .wxt-pronunciation-enabled {
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }

      .wxt-pronunciation-enabled:hover {
        background-color: rgba(106, 136, 224, 0.1);
        border-radius: 3px;
      }

            /* 短语翻译双层交互样式 */
      .wxt-has-word-overlay {
        position: relative !important;
      }

      .wxt-word-hover-area {
        position: absolute;
        pointer-events: auto;
        z-index: 1;
        background: transparent;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-radius: 2px;
      }

      .wxt-word-hover-area:hover {
        background-color: rgba(106, 136, 224, 0.1) !important;
      }

      .wxt-word-hover-area.wxt-pronunciation-enabled:hover {
        background-color: rgba(106, 136, 224, 0.15) !important;
      }

      .wxt-pronunciation-loading {
        opacity: 0.7;
        position: relative;
      }

      .wxt-pronunciation-loading::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        margin: auto;
        border: 2px solid transparent;
        border-top-color: #6a88e0;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        top: -2px;
        right: -16px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 深色词典风格工具提示卡片 */
      .wxt-pronunciation-tooltip {
        position: fixed;
        z-index: 10000;
        pointer-events: auto;
        animation: wxt-tooltip-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.25)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.06));
      }

      @keyframes wxt-tooltip-appear {
        from {
          opacity: 0;
          transform: translateY(-12px) scale(0.94);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .wxt-tooltip-card {
        background: #2a2a2c;
        border: 1px solid #48484a;
        border-radius: 12px;
        box-shadow: 0 15px 35px -8px rgba(0, 0, 0, 0.3);
        padding: 0;
        min-width: 240px;
        max-width: 320px;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        position: relative;
        overflow: hidden;
      }

      .wxt-tooltip-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
      }

      .wxt-tooltip-header {
        background: linear-gradient(135deg, #3a3a3c 0%, #2a2a2c 100%);
        padding: 16px 16px 12px 16px;
        border-bottom: 1px solid #48484a;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        position: relative;
      }

      .wxt-tooltip-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 16px;
        right: 16px;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      }

      .wxt-word-info {
        flex: 1;
        min-width: 0;
      }

      .wxt-word-main {
        font-size:  18px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4px;
        word-break: break-word;
        letter-spacing: -0.01em;
        line-height: 1.2;
      }

      .wxt-phonetic-text {
        font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
        font-size: 14px;
        color: #34d399;
        font-style: normal;
        font-weight: 500;
        background: rgba(52, 211, 153, 0.12);
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
        border: 1px solid rgba(52, 211, 153, 0.24);
        letter-spacing: 0.02em;
      }

      .wxt-tooltip-body {
        padding: 12px 16px 10px 16px;
        background: #2a2a2c;
      }

      .wxt-part-of-speech {
        display: inline-block;
        background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        box-shadow: 0 2px 6px rgba(0, 122, 255, 0.25);
      }

      .wxt-definition {
        font-size: 13px;
        line-height: 1.5;
        color: #e5e5e7;
        margin: 0;
        font-weight: 400;
      }

      .wxt-audio-btn {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        border: none;
        border-radius: 10px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #ffffff;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        box-shadow: 0 3px 10px rgba(52, 211, 153, 0.3);
        position: relative;
        overflow: hidden;
      }

      .wxt-audio-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .wxt-audio-btn:hover {
        transform: translateY(-1px) scale(1.05);
        box-shadow: 0 6px 18px rgba(52, 211, 153, 0.4);
      }

      .wxt-audio-btn:hover::before {
        opacity: 1;
      }

      .wxt-audio-btn:active {
        transform: translateY(0) scale(0.98);
        box-shadow: 0 2px 6px rgba(52, 211, 153, 0.25);
      }

      .wxt-audio-btn svg {
        width: 16px;
        height: 16px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      }

      /* 工具提示箭头 */
      .wxt-tooltip-arrow {
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 14px;
        height: 14px;
        background: #2a2a2c;
        border: 1px solid #48484a;
        border-top: none;
        border-left: none;
      }

      .wxt-tooltip-arrow-top {
        bottom: auto;
        top: -7px;
        transform: translateX(-50%) rotate(-135deg);
        border: 1px solid #48484a;
        border-bottom: none;
        border-right: none;
      }

      /* 短语相关样式 */
      .wxt-phrase-text {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin: 2px 0 0 0;
        line-height: 1.3;
        opacity: 0.95;
      }

      .wxt-word-list {
        line-height: 1.8;
        padding: 4px 0;
        font-size: 12px;
      }

      .wxt-interactive-word {
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-block;
        margin: 2px 3px;
        color: #e5e5e7;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: 500;
      }

      .wxt-interactive-word:hover {
        background: rgba(52, 211, 153, 0.15);
        color: #34d399;
        transform: translateY(-1px);
        border-color: rgba(52, 211, 153, 0.3);
        box-shadow: 0 2px 8px rgba(52, 211, 153, 0.2);
      }

      /* 单词悬浮框样式(更小更简洁) */
      .wxt-word-tooltip {
        position: fixed;
        z-index: 10001;
        visibility: hidden;
        opacity: 0;
        transition: all 0.2s ease;
        pointer-events: auto;
        animation: wxt-word-tooltip-appear 0.15s ease-out;
      }

      .wxt-word-tooltip[data-show="true"] {
        visibility: visible;
        opacity: 1;
      }

      @keyframes wxt-word-tooltip-appear {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .wxt-word-tooltip-card {
        background: #2a2a2c;
        border: 1px solid #48484a;
        border-radius: 10px;
        padding: 10px 12px;
        color: white;
        font-size: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        max-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        position: relative;
        overflow: hidden;
      }

      .wxt-word-tooltip-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      }

      .wxt-word-tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .wxt-word-tooltip-header .wxt-word-main {
        font-weight: 600;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: -0.01em;
      }

      .wxt-word-tooltip-header .wxt-phonetic-text {
        font-size: 12px;
        color: #34d399;
        font-style: normal;
        font-weight: 500;
        background: rgba(52, 211, 153, 0.12);
        padding: 3px 6px;
        border-radius: 6px;
        border: 1px solid rgba(52, 211, 153, 0.2);
        font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
      }

      .wxt-word-audio-btn {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        border: none;
        border-radius: 6px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        margin-left: auto;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(52, 211, 153, 0.25);
      }

      .wxt-word-audio-btn:hover {
        transform: translateY(-1px) scale(1.05);
        box-shadow: 0 3px 10px rgba(52, 211, 153, 0.35);
      }

      .wxt-word-tooltip-body {
        border-top: 1px solid #48484a;
        padding-top: 6px;
        margin-top: 6px;
      }

      .wxt-word-tooltip-body .wxt-part-of-speech {
        font-size: 11px;
        margin-bottom: 6px;
        background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 12px;
        display: inline-block;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .wxt-word-tooltip-body .wxt-definition {
        font-size: 12px;
        line-height: 1.5;
        color: #e5e5e7;
        margin: 0;
        font-weight: 400;
      }

      /* 响应式适配 */
      @media (max-width: 480px) {
        .wxt-tooltip-card {
          min-width: 200px;
          max-width: 280px;
        }

        .wxt-tooltip-header {
          padding: 14px 14px 10px 14px;
        }

        .wxt-tooltip-body {
          padding: 0 14px 14px 14px;
        }

        .wxt-word-main {
          font-size: 16px;
        }
      }
    `;

    document.head.appendChild(styleElement);
  }
}
