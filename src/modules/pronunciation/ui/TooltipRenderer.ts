/**
 * 悬浮框渲染器
 * 负责生成悬浮框的HTML内容
 */

import { PronunciationElementData } from '../types';
import { PronunciationUIConfig } from '../config';
import { DOMUtils } from '../utils';

export class TooltipRenderer {
  private uiConfig: PronunciationUIConfig;

  constructor(uiConfig: PronunciationUIConfig) {
    this.uiConfig = uiConfig;
  }

  /**
   * 创建主悬浮框HTML
   * @param elementData 元素数据
   */
  createMainTooltipHTML(elementData: PronunciationElementData): string {
    const words = DOMUtils.extractWords(elementData.word);
    const isPhrase = words.length > 1;

    if (isPhrase) {
      return this.createPhraseTooltipHTML(elementData.word, words);
    } else {
      return this.createWordTooltipHTML(elementData);
    }
  }

  /**
   * 创建短语悬浮框HTML
   * @param phrase 短语文本
   * @param words 单词数组
   */
  private createPhraseTooltipHTML(phrase: string, words: string[]): string {
    const interactiveWordList = DOMUtils.createInteractiveWordList(words);

    return `
      <div class="wxt-tooltip-card">
        <div class="wxt-tooltip-header">
          <div class="wxt-word-info">
            <div class="wxt-word-main">短语</div>
            <div class="wxt-phrase-text">${phrase}</div>
          </div>
          ${this.uiConfig.showPlayButton ? `
            <button class="wxt-audio-btn" title="朗读">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="wxt-tooltip-body">
          <div class="wxt-phrase-words">${interactiveWordList}</div>
        </div>
        <div class="wxt-tooltip-arrow"></div>
      </div>
    `;
  }

  /**
* 创建单词悬浮框HTML
* @param elementData 元素数据
*/
  private createWordTooltipHTML(elementData: PronunciationElementData): string {
    const phonetic = elementData.phonetic;
    const phoneticText = phonetic?.phonetics[0]?.text || '';

    return `
      <div class="wxt-tooltip-card">
        <div class="wxt-tooltip-header">
          <div class="wxt-word-info">
            <div class="wxt-word-main">${elementData.word}</div>
            ${phoneticText ? `<div class="wxt-phonetic-row"><div class="wxt-phonetic-text">${phoneticText}</div></div>` : ''}
          </div>
          ${this.uiConfig.showPlayButton ? `
            <button class="wxt-audio-btn" title="朗读单词">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="wxt-tooltip-arrow"></div>
      </div>
    `;
  }

  /**
   * 创建嵌套单词悬浮框HTML（用于短语中的单词）
   * @param word 单词
   * @param phoneticText 音标文本
   * @param partOfSpeech 词性
   */
  createNestedWordTooltipHTML(word: string, phoneticText?: string): string {
    // 音标文本，如果没有则为空字符串
    const phonetic = phoneticText || '';

    return `
      <div class="wxt-word-tooltip-card">
        <div class="wxt-word-tooltip-header">
          <div class="wxt-word-info">
            <div class="wxt-word-main">${word}</div>
            <div class="wxt-phonetic-row">
              <div class="wxt-phonetic-container">
                ${phonetic ? `<div class="wxt-phonetic-text">${phonetic}</div>` : ''}
                <div class="wxt-accent-buttons">
                  <div class="wxt-accent-group">
                    <span class="wxt-accent-label">英</span>
                    <button class="wxt-accent-audio-btn" data-accent="uk" title="英式发音">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="wxt-accent-group">
                    <span class="wxt-accent-label">美</span>
                    <button class="wxt-accent-audio-btn" data-accent="us" title="美式发音">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 更新UI配置
   * @param uiConfig 新的UI配置
   */
  updateConfig(uiConfig: PronunciationUIConfig): void {
    this.uiConfig = uiConfig;
  }
}
