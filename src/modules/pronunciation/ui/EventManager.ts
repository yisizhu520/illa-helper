/**
 * 事件管理器
 * 负责处理悬浮框的交互事件
 */

import { PronunciationElementData, ElementEventHandlers } from '../types';
import { TimerManager } from '../utils';

export class EventManager {
  private timerManager: TimerManager;
  private eventHandlers: Map<HTMLElement, ElementEventHandlers>;

  constructor(timerManager: TimerManager) {
    this.timerManager = timerManager;
    this.eventHandlers = new Map();
  }

  /**
   * 为元素添加事件监听器
   * @param element 目标元素
   * @param elementData 元素数据
   * @param onMouseEnter 鼠标进入处理函数
   * @param onMouseLeave 鼠标离开处理函数
   */
  attachElementEvents(
    element: HTMLElement,
    elementData: PronunciationElementData,
    onMouseEnter: (elementData: PronunciationElementData) => void,
    onMouseLeave: (elementData: PronunciationElementData) => void,
  ): void {
    // 创建事件处理器
    const mouseEnterHandler = (event: Event) => {
      this.timerManager.clear(
        `${element.dataset.pronunciationId || 'unknown'}_hide`,
      );
      onMouseEnter(elementData);
    };

    const mouseLeaveHandler = (event: Event) => {
      onMouseLeave(elementData);
    };

    // 存储事件处理器引用
    this.eventHandlers.set(element, {
      mouseEnterHandler,
      mouseLeaveHandler,
    });

    // 添加事件监听器
    element.addEventListener('mouseenter', mouseEnterHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);
  }

  /**
   * 为悬浮框添加事件监听器
   * @param tooltip 悬浮框元素
   * @param elementData 元素数据
   * @param onMouseEnter 鼠标进入处理函数
   * @param onMouseLeave 鼠标离开处理函数
   * @param onAudioClick 音频按钮点击处理函数
   */
  attachTooltipEvents(
    tooltip: HTMLElement,
    elementData: PronunciationElementData,
    onMouseEnter: (elementData: PronunciationElementData) => void,
    onMouseLeave: (elementData: PronunciationElementData) => void,
    onAudioClick: (word: string) => void,
  ): void {
    // 鼠标进入悬浮框
    tooltip.addEventListener('mouseenter', () => {
      const elementId =
        elementData.element.dataset.pronunciationId || 'unknown';
      this.timerManager.clear(`${elementId}_hide`);
      this.timerManager.clear(`${elementId}_wordHide`);
    });

    // 鼠标离开悬浮框
    tooltip.addEventListener('mouseleave', (event) => {
      const relatedTarget = event.relatedTarget as HTMLElement;

      // 如果鼠标移动到原始元素，不隐藏悬浮框
      if (relatedTarget && relatedTarget === elementData.element) {
        return;
      }

      onMouseLeave(elementData);
    });

    // 音频按钮点击事件
    const audioBtn = tooltip.querySelector('.wxt-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        onAudioClick(elementData.word);
      });
    }
  }

  /**
   * 为单词交互区域添加事件监听器
   * @param wordElement 单词元素
   * @param word 单词文本
   * @param onWordMouseEnter 单词鼠标进入处理函数
   * @param onWordMouseLeave 单词鼠标离开处理函数
   */
  attachWordEvents(
    wordElement: HTMLElement,
    word: string,
    onWordMouseEnter: (word: string, element: HTMLElement) => void,
    onWordMouseLeave: () => void,
  ): void {
    wordElement.addEventListener('mouseenter', () => {
      const wordElementId = wordElement.dataset.wordId || word;
      this.timerManager.clear(`${wordElementId}_wordHide`);
      onWordMouseEnter(word, wordElement);
    });

    wordElement.addEventListener('mouseleave', () => {
      onWordMouseLeave();
    });
  }

  /**
   * 为单词悬浮框添加事件监听器
   * @param wordTooltip 单词悬浮框元素
   * @param word 单词文本
   * @param onAudioClick 音频按钮点击处理函数（支持口音参数）
   */
  attachWordTooltipEvents(
    wordTooltip: HTMLElement,
    word: string,
    onAudioClick: (word: string, accent?: string) => void,
  ): void {
    // 阻止事件冒泡
    wordTooltip.addEventListener('mouseenter', (event) => {
      event.stopPropagation();
    });

    wordTooltip.addEventListener('mouseleave', (event) => {
      event.stopPropagation();
    });

    // 音频按钮点击事件（支持英式和美式发音）
    const audioBtns = wordTooltip.querySelectorAll('.wxt-phonetic-audio-btn');
    audioBtns.forEach((audioBtn) => {
      audioBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const accent = audioBtn.getAttribute('data-accent') || undefined;
        onAudioClick(word, accent);
      });
    });
  }

  /**
   * 移除元素的事件监听器
   * @param element 目标元素
   */
  removeElementEvents(element: HTMLElement): void {
    const handlers = this.eventHandlers.get(element);
    if (handlers) {
      element.removeEventListener('mouseenter', handlers.mouseEnterHandler);
      element.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
      this.eventHandlers.delete(element);
    }
  }

  /**
   * 清理所有事件监听器
   */
  cleanup(): void {
    this.eventHandlers.forEach((handlers, element) => {
      this.removeElementEvents(element);
    });
    this.eventHandlers.clear();
  }
}
