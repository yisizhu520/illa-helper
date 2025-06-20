/**
 * 发音服务主类
 * 协调音标获取和朗读功能，作为对外的统一接口
 */

import { IPhoneticProvider } from '../interfaces/IPhoneticProvider';
import { PhoneticProviderFactory } from '../providers/PhoneticProviderFactory';
import { ITTSProvider } from '../interfaces/ITTSProvider';
import { TTSProviderFactory } from '../providers/TTSProviderFactory';
import {
  PronunciationConfig,
  PhoneticResult,
  TTSResult,
  PhoneticInfo,
  PronunciationElementData,
  DEFAULT_PRONUNCIATION_CONFIG,
} from '../types/pronunciationTypes';

/**
 * 定时器管理器 - 统一管理所有定时器
 */
class TimerManager {
  private timers = new Map<string, number>();

  set(key: string, callback: () => void, delay: number): void {
    this.clear(key);
    const timerId = window.setTimeout(() => {
      callback();
      this.timers.delete(key);
    }, delay);
    this.timers.set(key, timerId);
  }

  clear(key: string): void {
    const timerId = this.timers.get(key);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(key);
    }
  }

  clearAll(): void {
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }
}

/**
 * 通用定位工具类
 */
class PositionUtils {
  static positionTooltip(element: HTMLElement, tooltip: HTMLElement, zIndex = 10000, position: 'top' | 'bottom' | 'auto' = 'auto'): void {
    // 先设置基本样式，让tooltip可以被测量
    tooltip.style.cssText = `
      position: fixed;
      visibility: hidden;
      z-index: ${zIndex};
    `;

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 12;

    // 计算水平位置（居中对齐）
    let left = rect.left + (rect.width - tooltipRect.width) / 2;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    // 计算垂直位置
    let top: number;
    let arrowClass: string;

    if (position === 'bottom') {
      // 强制显示在下方
      top = rect.bottom + 12;
      arrowClass = 'wxt-tooltip-arrow wxt-tooltip-arrow-top';
    } else if (position === 'top') {
      // 强制显示在上方
      top = rect.top - tooltipRect.height - 12;
      arrowClass = 'wxt-tooltip-arrow';
    } else {
      // 自动选择（优先显示在上方）
      top = rect.top - tooltipRect.height - 12;
      arrowClass = 'wxt-tooltip-arrow';

      // 如果上方空间不足，显示在下方
      if (top < padding) {
        top = rect.bottom + 12;
        arrowClass = 'wxt-tooltip-arrow wxt-tooltip-arrow-top';
      }
    }

    // 垂直边界检查
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    // 更新箭头样式
    const arrow = tooltip.querySelector('.wxt-tooltip-arrow');
    if (arrow) {
      arrow.className = arrowClass;
    }

    // 应用最终位置
    tooltip.style.cssText = `
      position: fixed;
      left: ${left}px;
      top: ${top}px;
      z-index: ${zIndex};
      visibility: visible;
    `;
  }
}

export class PronunciationService {
  private config: PronunciationConfig;
  private phoneticProvider: IPhoneticProvider;
  private ttsProvider: ITTSProvider;
  private fallbackTTSProvider: ITTSProvider;
  private elementDataMap = new Map<HTMLElement, PronunciationElementData>();
  private timerManager = new TimerManager();
  private currentWordTooltip: HTMLElement | null = null;
  private currentMainTooltip: HTMLElement | null = null;
  private currentMainElement: HTMLElement | null = null;

  constructor(config?: Partial<PronunciationConfig>) {
    this.config = { ...DEFAULT_PRONUNCIATION_CONFIG, ...config };
    this.phoneticProvider = PhoneticProviderFactory.createProvider(this.config.provider);
    this.ttsProvider = TTSProviderFactory.createProvider(this.config.ttsConfig.provider, this.config.ttsConfig);

    // 始终创建Web Speech作为备用TTS提供者
    this.fallbackTTSProvider = TTSProviderFactory.createProvider('web-speech', {
      lang: this.config.ttsConfig.lang,
      rate: this.config.ttsConfig.rate,
      pitch: this.config.ttsConfig.pitch,
      volume: this.config.ttsConfig.volume,
    });
  }

  /**
   * 为翻译元素添加发音功能
   */
  async addPronunciationToElement(element: HTMLElement, word: string, isPhrase?: boolean): Promise<boolean> {
    try {
      if (!element || !word || this.elementDataMap.has(element)) {
        return false;
      }

      // 为元素添加唯一标识
      if (!element.getAttribute('data-wxt-id')) {
        element.setAttribute('data-wxt-id', `wxt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      }

      // 创建元素数据
      const elementData: PronunciationElementData = {
        word: word.toLowerCase().trim(),
        element,
      };

      // 存储元素数据
      this.elementDataMap.set(element, elementData);

      // 添加CSS类名
      element.classList.add('wxt-pronunciation-enabled');

      // 如果启用了内联显示，预加载音标
      if (this.config.uiConfig.inlineDisplay) {
        await this.preloadPhonetic(elementData);
      }

      // 添加事件监听器
      this.attachEventListeners(element, elementData);

      return true;
    } catch (error) {
      console.error('添加发音功能失败:', error);
      return false;
    }
  }

  /**
   * 移除元素的发音功能
   */
  removePronunciationFromElement(element: HTMLElement): void {
    const elementData = this.elementDataMap.get(element);
    if (!elementData) return;

    // 移除事件监听器
    this.removeEventListeners(element);

    // 清理相关定时器
    const elementKey = this.getElementKey(element);
    this.timerManager.clear(`hide-${elementKey}`);
    this.timerManager.clear(`show-${elementKey}`);

    // 移除工具提示
    if (elementData.tooltip) {
      elementData.tooltip.remove();
    }

    // 如果移除的是当前主悬浮框，清除引用
    if (this.currentMainElement === element) {
      this.currentMainTooltip = null;
      this.currentMainElement = null;
    }

    // 移除CSS类名
    element.classList.remove('wxt-pronunciation-enabled', 'wxt-pronunciation-loading');

    // 清理数据
    this.elementDataMap.delete(element);
  }

  /**
   * 获取单词的音标信息
   */
  async getPhonetic(word: string): Promise<PhoneticResult> {
    return this.phoneticProvider.getPhonetic(word);
  }

  /**
   * 朗读文本
   * 支持回退策略：主TTS提供者失败时自动回退到Web Speech API
   */
  async speakText(text: string): Promise<TTSResult> {
    try {
      // 首先尝试主TTS提供者
      const primaryResult = await this.ttsProvider.speak(text);

      if (primaryResult.success) {
        return primaryResult;
      }

      // 主提供者失败，尝试回退到备用提供者
      console.warn(`主TTS提供者(${this.ttsProvider.name})失败，回退到备用提供者`, primaryResult.error);

      // 检查备用提供者是否可用
      if (!this.fallbackTTSProvider.isAvailable()) {
        return {
          success: false,
          error: `主TTS提供者失败且备用提供者不可用: ${primaryResult.error}`,
        };
      }

      // 使用备用提供者
      const fallbackResult = await this.fallbackTTSProvider.speak(text);

      if (fallbackResult.success) {
        console.info(`TTS回退成功，使用备用提供者(${this.fallbackTTSProvider.name})`);
        return {
          success: true,
          // 可以选择是否告知用户使用了备用方案
        };
      } else {
        return {
          success: false,
          error: `主TTS和备用TTS都失败: 主=${primaryResult.error}, 备用=${fallbackResult.error}`,
        };
      }

    } catch (error) {
      // 处理意外错误
      console.error('TTS朗读过程中发生意外错误:', error);

      // 尝试备用提供者
      try {
        if (this.fallbackTTSProvider.isAvailable()) {
          const fallbackResult = await this.fallbackTTSProvider.speak(text);
          if (fallbackResult.success) {
            console.info('TTS异常回退成功');
            return { success: true };
          }
        }
      } catch (fallbackError) {
        console.error('备用TTS也发生异常:', fallbackError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '朗读功能暂时不可用',
      };
    }
  }

  /**
   * 停止朗读
   * 同时停止主TTS提供者和备用TTS提供者
   */
  stopSpeaking(): void {
    try {
      this.ttsProvider.stop();
    } catch (error) {
      console.error('停止主TTS提供者时出错:', error);
    }

    try {
      this.fallbackTTSProvider.stop();
    } catch (error) {
      console.error('停止备用TTS提供者时出错:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PronunciationConfig>): void {
    this.config = { ...this.config, ...config };

    // 更新音标提供者
    if (config.provider && config.provider !== this.phoneticProvider.name) {
      this.phoneticProvider = PhoneticProviderFactory.createProvider(config.provider);
    }

    // 更新TTS提供者
    if (config.ttsConfig) {
      if (config.ttsConfig.provider && config.ttsConfig.provider !== this.ttsProvider.name) {
        this.ttsProvider = TTSProviderFactory.createProvider(config.ttsConfig.provider, config.ttsConfig);
      } else {
        this.ttsProvider.updateConfig(config.ttsConfig);
      }

      // 同时更新备用TTS提供者的相关配置（保持Web Speech配置同步）
      this.fallbackTTSProvider.updateConfig({
        lang: config.ttsConfig.lang,
        rate: config.ttsConfig.rate,
        pitch: config.ttsConfig.pitch,
        volume: config.ttsConfig.volume,
      });
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): PronunciationConfig {
    return { ...this.config };
  }

  /**
   * 获取TTS提供者状态信息
   */
  getTTSProviderStatus(): {
    primary: { name: string; available: boolean; speaking: boolean };
    fallback: { name: string; available: boolean; speaking: boolean };
  } {
    return {
      primary: {
        name: this.ttsProvider.name,
        available: this.ttsProvider.isAvailable(),
        speaking: this.ttsProvider.isSpeaking(),
      },
      fallback: {
        name: this.fallbackTTSProvider.name,
        available: this.fallbackTTSProvider.isAvailable(),
        speaking: this.fallbackTTSProvider.isSpeaking(),
      },
    };
  }

  /**
   * 获取元素的唯一键
   */
  private getElementKey(element: HTMLElement): string {
    return element.getAttribute('data-wxt-id') || 'unknown';
  }

  /**
   * 预加载音标信息
   */
  private async preloadPhonetic(elementData: PronunciationElementData): Promise<void> {
    if (elementData.phonetic) return;

    try {
      elementData.element.classList.add('wxt-pronunciation-loading');

      const result = await this.phoneticProvider.getPhonetic(elementData.word);
      if (result.success && result.data) {
        elementData.phonetic = result.data;
        this.displayInlinePhonetic(elementData);
      }
    } catch (error) {
      console.error('预加载音标失败:', error);
    } finally {
      elementData.element.classList.remove('wxt-pronunciation-loading');
    }
  }

  /**
   * 显示内联音标
   */
  private displayInlinePhonetic(elementData: PronunciationElementData): void {
    if (!elementData.phonetic || !this.config.uiConfig.showPhonetic) return;

    const phoneticText = elementData.phonetic.phonetics[0]?.text;
    if (!phoneticText) return;

    // 创建音标元素
    const phoneticSpan = document.createElement('span');
    phoneticSpan.className = 'wxt-phonetic-inline';
    phoneticSpan.textContent = ` ${phoneticText}`;
    phoneticSpan.style.cssText = `
      font-size: 0.85em;
      color: #666;
      margin-left: 2px;
      font-style: italic;
    `;

    elementData.element.appendChild(phoneticSpan);
  }

  /**
   * 添加事件监听器
   */
  private attachEventListeners(element: HTMLElement, elementData: PronunciationElementData): void {
    const mouseEnterHandler = async () => {
      await this.handleMouseEnter(elementData);
    };

    const mouseLeaveHandler = () => {
      this.handleMouseLeave(elementData);
    };

    element.addEventListener('mouseenter', mouseEnterHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    // 存储处理器引用以便后续移除
    (element as any).__wxtHandlers = {
      mouseEnterHandler,
      mouseLeaveHandler,
    };
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(element: HTMLElement): void {
    const handlers = (element as any).__wxtHandlers;
    if (handlers) {
      element.removeEventListener('mouseenter', handlers.mouseEnterHandler);
      element.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
      delete (element as any).__wxtHandlers;
    }
  }

  /**
   * 处理鼠标进入事件
   */
  private async handleMouseEnter(elementData: PronunciationElementData): Promise<void> {
    if (!this.config.uiConfig.tooltipEnabled) return;

    const elementKey = this.getElementKey(elementData.element);

    // 取消之前的定时器
    this.timerManager.clear(`hide-${elementKey}`);
    this.timerManager.clear(`show-${elementKey}`);

    // 设置延迟显示定时器
    this.timerManager.set(`show-${elementKey}`, async () => {
      // 检查是否为短语
      const words = this.extractWords(elementData.word);
      const isPhrase = words.length > 1;

      // 如果是短语，直接显示悬浮框，不需要获取音标
      if (isPhrase) {
        this.showTooltip(elementData);
        return;
      }

      // 单词情况：如果没有音标数据，尝试获取
      if (!elementData.phonetic) {
        try {
          elementData.element.classList.add('wxt-pronunciation-loading');
          const result = await this.phoneticProvider.getPhonetic(elementData.word);
          if (result.success && result.data) {
            elementData.phonetic = result.data;
          }
        } catch (error) {
          console.error('获取音标失败:', error);
        } finally {
          elementData.element.classList.remove('wxt-pronunciation-loading');
        }
      }

      // 显示工具提示
      this.showTooltip(elementData);
    }, 400); // 400ms延迟显示
  }

  /**
   * 处理鼠标离开事件
   */
  private handleMouseLeave(elementData: PronunciationElementData): void {
    const elementKey = this.getElementKey(elementData.element);

    // 取消显示定时器（如果还在等待显示）
    this.timerManager.clear(`show-${elementKey}`);

    // 延迟隐藏工具提示，给用户时间移动到tooltip上
    this.timerManager.set(`hide-${elementKey}`, () => {
      // 只有在没有单词悬浮框显示时才隐藏主悬浮框
      if (!this.currentWordTooltip) {
        this.hideTooltip(elementData);
      }
    }, 600); // 600ms延迟
  }

  /**
   * 显示工具提示
   */
  private showTooltip(elementData: PronunciationElementData): void {
    // 只清理其他元素的悬浮框，保留当前元素的定时器
    this.cleanupOtherTooltips(elementData.element);

    // 同时隐藏单词悬浮框
    this.hideWordTooltip();

    // 检查是否为短语
    const words = this.extractWords(elementData.word);
    const isPhrase = words.length > 1;

    // 对于单词需要音标数据，对于短语不需要
    if (!isPhrase && !elementData.phonetic) return;

    // 如果已存在工具提示，先移除
    if (elementData.tooltip) {
      elementData.tooltip.remove();
    }

    // 创建工具提示
    const tooltip = this.createTooltip(elementData);
    elementData.tooltip = tooltip;
    document.body.appendChild(tooltip);

    // 定位工具提示
    PositionUtils.positionTooltip(elementData.element, tooltip);

    // 设置为当前主悬浮框
    this.currentMainTooltip = tooltip;
    this.currentMainElement = elementData.element;
  }

  /**
   * 隐藏工具提示
   */
  private hideTooltip(elementData: PronunciationElementData): void {
    if (elementData.tooltip) {
      elementData.tooltip.remove();
      elementData.tooltip = undefined;
    }

    // 如果隐藏的是当前主悬浮框，清除引用
    if (this.currentMainElement === elementData.element) {
      this.currentMainTooltip = null;
      this.currentMainElement = null;
    }
  }

  /**
   * 清理其他元素的悬浮框，保留指定元素的定时器
   */
  private cleanupOtherTooltips(currentElement: HTMLElement): void {
    const currentElementKey = this.getElementKey(currentElement);

    // 遍历所有元素，移除其他元素的悬浮框
    for (const [element, elementData] of this.elementDataMap.entries()) {
      if (element !== currentElement && elementData.tooltip) {
        // 清理其他元素的定时器
        const elementKey = this.getElementKey(element);
        this.timerManager.clear(`hide-${elementKey}`);
        this.timerManager.clear(`show-${elementKey}`);

        // 移除悬浮框
        elementData.tooltip.remove();
        elementData.tooltip = undefined;
      }
    }

    // 清理单词悬浮框相关定时器
    this.timerManager.clear('word-show');
    this.timerManager.clear('word-hide');

    // 更新当前主悬浮框引用
    this.currentMainTooltip = null;
    this.currentMainElement = null;

    // 强制清理页面上所有悬浮框元素（包括可能的遗留元素）
    const allTooltips = document.querySelectorAll('.wxt-pronunciation-tooltip, .wxt-word-tooltip');
    allTooltips.forEach(tooltip => {
      try {
        tooltip.remove();
      } catch (e) {
        // 忽略移除失败的情况
      }
    });
  }

  /**
   * 强制清理所有现有的悬浮框
   */
  private forceCleanupAllTooltips(): void {
    // 清理所有定时器
    this.timerManager.clearAll();

    // 遍历所有元素，强制移除悬浮框
    for (const [element, elementData] of this.elementDataMap.entries()) {
      if (elementData.tooltip) {
        elementData.tooltip.remove();
        elementData.tooltip = undefined;
      }
    }

    // 清理当前主悬浮框引用
    this.currentMainTooltip = null;
    this.currentMainElement = null;

    // 强制清理页面上所有悬浮框元素（包括可能的遗留元素）
    const allTooltips = document.querySelectorAll('.wxt-pronunciation-tooltip, .wxt-word-tooltip');
    allTooltips.forEach(tooltip => {
      try {
        tooltip.remove();
      } catch (e) {
        // 忽略移除失败的情况
      }
    });
  }

  /**
   * 强制清理所有单词悬浮框
   */
  private forceCleanupWordTooltips(): void {
    // 清理单词相关定时器
    this.timerManager.clear('word-show');
    this.timerManager.clear('word-hide');

    // 移除当前单词悬浮框
    if (this.currentWordTooltip) {
      this.currentWordTooltip.remove();
      this.currentWordTooltip = null;
    }

    // 清理页面上所有可能遗留的单词悬浮框元素
    const existingWordTooltips = document.querySelectorAll('.wxt-word-tooltip');
    existingWordTooltips.forEach(tooltip => tooltip.remove());
  }

  /**
   * 创建工具提示
   */
  private createTooltip(elementData: PronunciationElementData): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'wxt-pronunciation-tooltip';

    // 检查是否为短语（包含多个单词）
    const words = this.extractWords(elementData.word);
    const isPhrase = words.length > 1;

    if (isPhrase) {
      // 短语悬浮框：显示整个句子，内部支持单词交互
      tooltip.innerHTML = this.createPhraseTooltipHTML(elementData.word, words);
    } else {
      // 单词悬浮框：显示单个单词信息
      tooltip.innerHTML = this.createWordTooltipHTML(elementData);
    }

    // 添加主悬浮框事件处理
    this.attachTooltipEventListeners(tooltip, elementData);

    // 如果是短语，添加单词交互功能
    if (isPhrase) {
      this.setupWordInteractions(tooltip, words);
    }

    return tooltip;
  }

  /**
   * 创建短语悬浮框HTML
   */
  private createPhraseTooltipHTML(phrase: string, words: string[]): string {
    return `
      <div class="wxt-tooltip-card">
        <div class="wxt-tooltip-header">
          <div class="wxt-word-info">
            <div class="wxt-word-main">短语</div>
            <div class="wxt-phrase-text">${phrase}</div>
          </div>
          ${this.config.uiConfig.showPlayButton ? `
            <button class="wxt-audio-btn" title="朗读">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="wxt-tooltip-body">
          <div class="wxt-word-list">${this.createInteractiveWordList(words)}</div>
        </div>
        <div class="wxt-tooltip-arrow"></div>
      </div>
    `;
  }

  /**
   * 创建单词悬浮框HTML
   */
  private createWordTooltipHTML(elementData: PronunciationElementData): string {
    const phonetic = elementData.phonetic;
    const phoneticText = phonetic?.phonetics[0]?.text || '';
    const meanings = phonetic?.meanings || [];
    const partOfSpeech = meanings[0]?.partOfSpeech || '';

    return `
      <div class="wxt-tooltip-card">
        <div class="wxt-tooltip-header">
          <div class="wxt-word-info">
            <div class="wxt-word-main">${elementData.word}</div>
            ${phoneticText ? `<div class="wxt-phonetic-text">${phoneticText}</div>` : ''}
          </div>
          ${this.config.uiConfig.showPlayButton ? `
            <button class="wxt-audio-btn" title="朗读单词">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        ${partOfSpeech ? `
          <div class="wxt-tooltip-body">
            <div class="wxt-part-of-speech">${partOfSpeech}</div>
          </div>
        ` : ''}
        <div class="wxt-tooltip-arrow"></div>
      </div>
    `;
  }

  /**
   * 为tooltip添加事件监听器
   */
  private attachTooltipEventListeners(tooltip: HTMLElement, elementData: PronunciationElementData): void {
    const elementKey = this.getElementKey(elementData.element);

    tooltip.addEventListener('mouseenter', () => {
      // 鼠标进入悬浮框时，取消隐藏定时器
      this.timerManager.clear(`hide-${elementKey}`);
    });

    tooltip.addEventListener('mouseleave', () => {
      // 鼠标离开悬浮框时，延迟隐藏主悬浮框
      this.timerManager.set(`hide-${elementKey}`, () => {
        // 只有在没有单词悬浮框显示时才隐藏主悬浮框
        if (!this.currentWordTooltip) {
          this.hideTooltip(elementData);
        }
      }, 600);
    });

    // 添加朗读功能
    const audioBtn = tooltip.querySelector('.wxt-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.speakText(elementData.word);
      });
    }
  }

  /**
   * 提取单词
   */
  private extractWords(text: string): string[] {
    return text
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word => word.length > 0 && /^[a-zA-Z\-']+$/.test(word))
      .map(word => word.replace(/^[^\w\-']+|[^\w\-']+$/g, ''))
      .filter(word => word.length > 0);
  }

  /**
   * 创建可交互的单词列表
   */
  private createInteractiveWordList(words: string[]): string {
    return words.map(word =>
      `<span class="wxt-interactive-word" data-word="${word}">${word}</span>`
    ).join(' ');
  }

  /**
   * 为短语悬浮框中的单词设置交互
   */
  private setupWordInteractions(tooltip: HTMLElement, words: string[]): void {
    const wordElements = tooltip.querySelectorAll('.wxt-interactive-word');

    wordElements.forEach((wordElement) => {
      const word = wordElement.getAttribute('data-word');
      if (!word) return;

      wordElement.addEventListener('mouseenter', async () => {
        // 取消任何待执行的定时器
        this.timerManager.clear('word-hide');
        this.timerManager.clear('word-show');

        // 隐藏之前的单词悬浮框（确保唯一性）
        this.hideWordTooltip();

        // 设置延迟显示定时器
        this.timerManager.set('word-show', async () => {
          await this.showWordTooltip(wordElement as HTMLElement, word);
        }, 300); // 300ms延迟显示
      });

      wordElement.addEventListener('mouseleave', () => {
        // 取消显示定时器（如果还在等待显示）
        this.timerManager.clear('word-show');

        // 设置延迟隐藏定时器
        this.timerManager.set('word-hide', () => {
          this.hideWordTooltip();
        }, 600);
      });
    });
  }

  /**
   * 显示单词悬浮框
   */
  private async showWordTooltip(wordElement: HTMLElement, word: string): Promise<void> {
    try {
      // 强制清理所有单词悬浮框
      this.forceCleanupWordTooltips();

      // 取消所有主悬浮框的隐藏定时器，防止主悬浮框在单词悬浮框显示时消失
      this.cancelAllMainTooltipHideTimers();

      // 获取单词的音标信息
      const result = await this.phoneticProvider.getPhonetic(word);
      if (!result.success || !result.data) return;

      // 创建单词悬浮框
      const wordTooltip = document.createElement('div');
      wordTooltip.className = 'wxt-word-tooltip';

      const phonetic = result.data;
      const phoneticText = phonetic.phonetics[0]?.text || '';
      const meanings = phonetic.meanings || [];
      const partOfSpeech = meanings[0]?.partOfSpeech || '';

      wordTooltip.innerHTML = `
        <div class="wxt-word-tooltip-card">
          <div class="wxt-word-tooltip-header">
            <div class="wxt-word-main">${word}</div>
            ${phoneticText ? `<div class="wxt-phonetic-text">${phoneticText}</div>` : ''}
            <button class="wxt-word-audio-btn" title="朗读">🔊</button>
          </div>
          ${partOfSpeech ? `
            <div class="wxt-word-tooltip-body">
              <div class="wxt-part-of-speech">${partOfSpeech}</div>
            </div>
          ` : ''}
        </div>
      `;

      // 添加朗读功能
      const audioBtn = wordTooltip.querySelector('.wxt-word-audio-btn');
      if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.speakText(word);
        });
      }

      // 鼠标事件处理
      wordTooltip.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        // 鼠标进入单词悬浮框时，取消单词悬浮框隐藏定时器
        this.timerManager.clear('word-hide');
        // 同时取消主悬浮框的隐藏定时器
        this.cancelAllMainTooltipHideTimers();
      });

      wordTooltip.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        // 鼠标离开单词悬浮框时，延迟隐藏
        this.timerManager.set('word-hide', () => {
          this.hideWordTooltip();
        }, 600);
      });

      // 定位和显示
      document.body.appendChild(wordTooltip);
      PositionUtils.positionTooltip(wordElement, wordTooltip, 10001, 'bottom');

      // 设置为当前悬浮框，确保唯一性
      this.currentWordTooltip = wordTooltip;

      // 添加显示动画
      requestAnimationFrame(() => {
        wordTooltip.style.visibility = 'visible';
        wordTooltip.style.opacity = '1';
      });

    } catch (error) {
      console.error('显示单词悬浮框失败:', error);
    }
  }

  /**
   * 取消所有主悬浮框的隐藏定时器
   */
  private cancelAllMainTooltipHideTimers(): void {
    for (const [element] of this.elementDataMap.entries()) {
      const elementKey = this.getElementKey(element);
      this.timerManager.clear(`hide-${elementKey}`);
    }
  }

  /**
   * 重启当前主悬浮框的隐藏定时器
   */
  private restartMainTooltipHideTimer(): void {
    if (this.currentMainElement) {
      const elementData = this.elementDataMap.get(this.currentMainElement);
      if (elementData) {
        const elementKey = this.getElementKey(this.currentMainElement);
        this.timerManager.set(`hide-${elementKey}`, () => {
          if (!this.currentWordTooltip) {
            this.hideTooltip(elementData);
          }
        }, 600);
      }
    }
  }

  /**
   * 隐藏单词悬浮框
   */
  private hideWordTooltip(): void {
    // 移除当前单词悬浮框
    if (this.currentWordTooltip) {
      this.currentWordTooltip.remove();
      this.currentWordTooltip = null;

      // 单词悬浮框隐藏后，重启主悬浮框的隐藏定时器
      this.restartMainTooltipHideTimer();
    }
  }

  /**
   * 清理所有资源
   */
  destroy(): void {
    // 清理所有定时器
    this.timerManager.clearAll();

    // 隐藏当前单词悬浮框
    this.hideWordTooltip();

    // 清理主悬浮框引用
    this.currentMainTooltip = null;
    this.currentMainElement = null;

    // 移除所有元素的发音功能
    for (const element of this.elementDataMap.keys()) {
      this.removePronunciationFromElement(element);
    }

    // 停止朗读
    this.stopSpeaking();

    // 清理数据
    this.elementDataMap.clear();
  }
}
