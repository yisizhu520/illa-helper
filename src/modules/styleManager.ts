/**
 * 样式管理模块
 * 负责管理翻译文本的样式
 */

// 翻译文本样式
export enum TranslationStyle {
  DEFAULT = 'default',
  SUBTLE = 'subtle',
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINED = 'underlined',
  HIGHLIGHTED = 'highlighted',
}

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
    `;

    document.head.appendChild(styleElement);
  }
} 