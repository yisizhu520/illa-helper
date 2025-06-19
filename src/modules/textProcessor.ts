import { OriginalWordDisplayMode } from './types';
/**
 * 文本处理模块
 * 负责遍历DOM，提取文本节点，并进行处理
 */

// 需要忽略的标签
const IGNORE_TAGS = new Set([
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
]);

// 定义块级元素，用于识别段落边界
const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'ARTICLE',
  'SECTION',
  'LI',
  'TD',
  'TH',
  'DD',
  'BLOCKQUOTE',
  'FIGCAPTION',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
]);

// 文本节点处理器
export class TextProcessor {
  private ignoreSelector: string;

  constructor() {
    // 将 'role="dialog"' 添加到忽略选择器中
    const ignoreTagsAndAttributes =
      Array.from(IGNORE_TAGS).join(',') + ',[role="dialog"]';
    this.ignoreSelector = ignoreTagsAndAttributes;
    this.injectGlowStyle();
  }

  private injectGlowStyle(): void {
    if ((window as any).wxtGlowStyleInjected) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wxt-glow-animation {
        from {
          background-color: rgba(106, 136, 224, 0.3);
          box-shadow: 0 0 8px rgba(106, 136, 224, 0.5);
        }
        to {
          background-color: transparent;
          box-shadow: 0 0 0 transparent;
        }
      }
      .wxt-glow {
        animation: wxt-glow-animation 0.8s ease-out;
        border-radius: 3px;
      }
      .wxt-original-word--learning {
        filter: blur(5px);
        cursor: pointer;
        transition: filter 0.2s ease-in-out;
      }
      .wxt-original-word--learning:hover {
        filter: blur(0);
      }
      @keyframes wxt-processing-animation {
        0% {
          background-color: rgba(106, 136, 224, 0.1);
        }
        50% {
          background-color: rgba(106, 136, 224, 0.3);
        }
        100% {
          background-color: rgba(106, 136, 224, 0.1);
        }
      }
      .wxt-processing {
        animation: wxt-processing-animation 2s infinite ease-in-out;
        border-radius: 3px;
        transition: background-color 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    (window as any).wxtGlowStyleInjected = true;
  }

  // =================================================================
  // Section 1: 新的核心处理流程 (New Core Processing Flow)
  // =================================================================
  public async processRoot(
    root: Node,
    textReplacer: any,
    originalWordDisplayMode: OriginalWordDisplayMode,
    maxLength: number = 400,
  ): Promise<void> {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element;
        // 核心过滤逻辑
        if (
          element.closest('[data-wxt-processed="true"]') ||
          element.closest(this.ignoreSelector)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        if (window.getComputedStyle(element).display === 'none') {
          return NodeFilter.FILTER_REJECT;
        }
        if (BLOCK_TAGS.has(element.tagName.toUpperCase())) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    });

    let blockElement: Node | null;
    while ((blockElement = walker.nextNode())) {
      // 找到一个块级元素后，立即构建并处理它的文本组
      const textGroups: Array<{
        nodes: Text[];
        combinedText: string;
        container: Element;
      }> = [];
      this.buildGroupsFromBlock(blockElement as Element, textGroups, maxLength);

      for (const group of textGroups) {
        await this.processTextGroup(
          group,
          textReplacer,
          originalWordDisplayMode,
        );
      }
    }
  }

  private buildGroupsFromBlock(
    blockElement: Element,
    textGroups: Array<{
      nodes: Text[];
      combinedText: string;
      container: Element;
    }>,
    maxLength: number,
  ) {
    let currentText = '';
    let currentNodes: Text[] = [];

    const textWalker = document.createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 子节点的文本同样需要检查是否在忽略的父元素下
          if (
            !node.textContent?.trim() ||
            node.parentElement?.closest(this.ignoreSelector)
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let textNode: Node | null;
    while ((textNode = textWalker.nextNode())) {
      const nodeText = textNode.textContent || '';
      if (currentText.length + nodeText.length > maxLength) {
        if (currentNodes.length > 0) {
          textGroups.push({
            nodes: currentNodes,
            combinedText: currentText,
            container: blockElement,
          });
        }
        currentText = '';
        currentNodes = [];
      }
      currentText += nodeText;
      currentNodes.push(textNode as Text);
    }

    if (currentNodes.length > 0) {
      textGroups.push({
        nodes: currentNodes,
        combinedText: currentText,
        container: blockElement,
      });
    }
  }

  // =================================================================
  // Section 2: 文本处理与替换 (Text Processing & Replacement)
  // =================================================================

  public async processTextGroup(
    textGroup: { nodes: Text[]; combinedText: string; container: Element },
    textReplacer: any,
    originalWordDisplayMode: OriginalWordDisplayMode,
  ): Promise<void> {
    // 关键修复：立即标记，防止重复处理
    textGroup.container.setAttribute('data-wxt-processed', 'true');
    let result: any = null;

    // 获取当前文本组所有不重复的直接父元素，以实现更小粒度的视觉反馈
    const parentElements = [
      ...new Set(
        textGroup.nodes.map((node) => node.parentElement).filter(Boolean),
      ),
    ] as HTMLElement[];

    try {
      // 对所有父元素应用处理中样式
      parentElements.forEach((el) => el.classList.add('wxt-processing'));

      result = await textReplacer.replaceText(textGroup.combinedText);
      if (result && result.replacements && result.replacements.length > 0) {
        this.applyReplacements(
          textGroup,
          result.replacements,
          textReplacer.styleManager,
          originalWordDisplayMode,
        );
      }
    } catch (error) {
      console.error('Error in processTextGroup:', error);
      if (result && result.replacements && result.replacements.length > 0) {
        this.applyReplacementsInFallback(
          textGroup,
          result.replacements,
          textReplacer.styleManager,
          originalWordDisplayMode,
        );
      }
    } finally {
      // 确保从所有父元素上移除处理中样式
      parentElements.forEach((el) => el.classList.remove('wxt-processing'));
    }
  }

  private applyReplacements(
    textGroup: { nodes: Text[]; combinedText: string; container: Element },
    replacements: any[],
    styleManager: any,
    originalWordDisplayMode: OriginalWordDisplayMode,
  ): void {
    const { nodes } = textGroup;
    for (let i = replacements.length - 1; i >= 0; i--) {
      const rep = replacements[i];
      if (!rep.position) continue;
      const range = this.findRangeForReplacement(
        nodes,
        rep.position.start,
        rep.position.end,
      );
      if (range) {
        const originalWordWrapper = document.createElement('span');
        originalWordWrapper.className = 'wxt-original-word';
        originalWordWrapper.textContent = range.toString();

        const translationSpan = document.createElement('span');
        translationSpan.className = `wxt-translation-term ${styleManager.getCurrentStyleClass()}`;
        translationSpan.textContent = ` (${rep.translation})`;

        range.surroundContents(originalWordWrapper);
        originalWordWrapper.after(translationSpan);

        switch (originalWordDisplayMode) {
          case OriginalWordDisplayMode.HIDDEN:
            originalWordWrapper.style.display = 'none';
            break;
          case OriginalWordDisplayMode.LEARNING:
            originalWordWrapper.classList.add('wxt-original-word--learning');
            break;
        }

        this.glow(translationSpan);
        originalWordWrapper.setAttribute('data-wxt-word-processed', 'true');
      }
    }
  }

  // =================================================================
  // Section 3: 智能回退替换 (Smart Fallback Replacement)
  // =================================================================

  private applyReplacementsInFallback(
    textGroup: { nodes: Text[]; combinedText: string; container: Element },
    replacements: any[],
    styleManager: any,
    originalWordDisplayMode: OriginalWordDisplayMode,
  ): void {
    // 尝试更稳健的单节点替换
    textGroup.nodes.forEach((node) => {
      this.applyReplacementsToSingleNode(
        node,
        replacements,
        styleManager,
        originalWordDisplayMode,
      );
    });
  }

  private findRangeForReplacement(
    nodes: Text[],
    start: number,
    end: number,
  ): Range | null {
    let charCount = 0;
    let startNode: Text | null = null,
      endNode: Text | null = null;
    let startOffset = 0,
      endOffset = 0;

    for (const node of nodes) {
      const nodeLength = node.textContent?.length || 0;
      if (startNode === null && charCount + nodeLength >= start) {
        startNode = node;
        startOffset = start - charCount;
      }
      if (endNode === null && charCount + nodeLength >= end) {
        endNode = node;
        endOffset = end - charCount;
      }
      if (startNode && endNode) break;
      charCount += nodeLength;
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    }
    return null;
  }

  // =================================================================
  // Section 4: 单节点处理 (基础工具)
  // =================================================================

  private applyReplacementsToSingleNode(
    node: Text,
    replacements: any[],
    styleManager: any,
    originalWordDisplayMode: OriginalWordDisplayMode,
  ): void {
    const parent = node.parentElement;
    if (!parent) return;

    let lastIndex = 0;
    const fragment = document.createDocumentFragment();

    replacements.forEach((rep) => {
      const index = node.textContent!.indexOf(rep.original, lastIndex);
      if (index > -1) {
        if (index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(
              node.textContent!.substring(lastIndex, index),
            ),
          );
        }

        const originalWordWrapper = document.createElement('span');
        originalWordWrapper.className = 'wxt-original-word';
        originalWordWrapper.textContent = rep.original;

        const translationSpan = document.createElement('span');
        translationSpan.className = `wxt-translation-term ${styleManager.getCurrentStyleClass()}`;
        translationSpan.textContent = ` (${rep.translation})`;

        switch (originalWordDisplayMode) {
          case OriginalWordDisplayMode.HIDDEN:
            originalWordWrapper.style.display = 'none';
            break;
          case OriginalWordDisplayMode.LEARNING:
            originalWordWrapper.classList.add('wxt-original-word--learning');
            break;
        }

        fragment.appendChild(originalWordWrapper);
        fragment.appendChild(translationSpan);

        lastIndex = index + rep.original.length;
        this.glow(translationSpan);
      }
    });

    if (lastIndex < node.textContent!.length) {
      fragment.appendChild(
        document.createTextNode(node.textContent!.substring(lastIndex)),
      );
    }

    parent.replaceChild(fragment, node);
  }

  private glow(element: Element | null | undefined): void {
    if (element) {
      element.classList.add('wxt-glow');
      setTimeout(() => {
        element.classList.remove('wxt-glow');
      }, 800); // 匹配动画时间
    }
  }
}
