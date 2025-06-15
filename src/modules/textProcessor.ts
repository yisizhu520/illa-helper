/**
 * 文本处理模块
 * 负责遍历DOM，提取文本节点，并进行处理
 */

// 需要忽略的标签
const IGNORE_TAGS = new Set([
  "SCRIPT", "STYLE", "META", "LINK", "IFRAME", "INPUT", "TEXTAREA",
  "SELECT", "OPTION", "CODE", "NAV", "FOOTER", "PRE", "IMG", "IMAGE",
  "TIME", "NOSCRIPT", "HEADER", "BANNER", "COPYRIGHT"
]);

// 定义块级元素，用于识别段落边界
const BLOCK_TAGS = new Set([
  'P', 'DIV', 'ARTICLE', 'SECTION', 'LI', 'TD', 'TH', 'DD',
  'BLOCKQUOTE', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
]);

// 文本节点处理器
export class TextProcessor {
  private ignoreSelector: string;

  constructor() {
    // 将 'role="dialog"' 添加到忽略选择器中
    const ignoreTagsAndAttributes = Array.from(IGNORE_TAGS).join(',') + ',[role="dialog"]';
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
    `;
    document.head.appendChild(style);
    (window as any).wxtGlowStyleInjected = true;
  }

  // =================================================================
  // Section 1: 新的核心处理流程 (New Core Processing Flow)
  // =================================================================
  public async processRoot(root: Node, textReplacer: any, maxLength: number = 400): Promise<void> {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element;
        // 核心过滤逻辑
        if (element.closest('[data-wxt-processed="true"]') || element.closest(this.ignoreSelector)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (window.getComputedStyle(element).display === 'none') {
          return NodeFilter.FILTER_REJECT;
        }
        if (BLOCK_TAGS.has(element.tagName.toUpperCase())) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    });

    let blockElement: Node | null;
    while (blockElement = walker.nextNode()) {
      // 找到一个块级元素后，立即构建并处理它的文本组
      const textGroups: Array<{ nodes: Text[], combinedText: string, container: Element }> = [];
      this.buildGroupsFromBlock(blockElement as Element, textGroups, maxLength);

      for (const group of textGroups) {
        await this.processTextGroup(group, textReplacer);
      }
    }
  }

  private buildGroupsFromBlock(
    blockElement: Element,
    textGroups: Array<{ nodes: Text[], combinedText: string, container: Element }>,
    maxLength: number
  ) {
    let currentText = '';
    let currentNodes: Text[] = [];

    const textWalker = document.createTreeWalker(blockElement, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // 子节点的文本同样需要检查是否在忽略的父元素下
        if (!node.textContent?.trim() || node.parentElement?.closest(this.ignoreSelector)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let textNode: Node | null;
    while (textNode = textWalker.nextNode()) {
      const nodeText = textNode.textContent || '';
      if (currentText.length + nodeText.length > maxLength) {
        if (currentNodes.length > 0) {
          textGroups.push({ nodes: currentNodes, combinedText: currentText, container: blockElement });
        }
        currentText = '';
        currentNodes = [];
      }
      currentText += nodeText;
      currentNodes.push(textNode as Text);
    }

    if (currentNodes.length > 0) {
      textGroups.push({ nodes: currentNodes, combinedText: currentText, container: blockElement });
    }
  }

  // =================================================================
  // Section 2: 文本处理与替换 (Text Processing & Replacement)
  // =================================================================

  public async processTextGroup(textGroup: { nodes: Text[], combinedText: string, container: Element }, textReplacer: any): Promise<void> {
    // 关键修复：立即标记，防止重复处理
    textGroup.container.setAttribute('data-wxt-processed', 'true');
    let result: any = null;

    try {
      result = await textReplacer.replaceText(textGroup.combinedText);
      if (result && result.replacements && result.replacements.length > 0) {
        this.applyReplacements(textGroup, result.replacements, textReplacer.styleManager);
      }
    } catch (error) {
      if (result && result.replacements && result.replacements.length > 0) {
        this.applyReplacementsInFallback(textGroup, result.replacements, textReplacer.styleManager);
      }
    }
  }

  private applyReplacements(textGroup: { nodes: Text[], combinedText: string, container: Element }, replacements: any[], styleManager: any): void {
    const { nodes, container } = textGroup;
    try {
      for (let i = replacements.length - 1; i >= 0; i--) {
        const rep = replacements[i];
        if (!rep.position) continue;
        const range = this.findRangeForReplacement(nodes, rep.position.start, rep.position.end);
        if (range) {
          const originalWordWrapper = document.createElement('span');
          originalWordWrapper.className = 'wxt-original-word';
          originalWordWrapper.textContent = range.toString();

          const translationSpan = document.createElement('span');
          translationSpan.className = `wxt-translation-term ${styleManager.getCurrentStyleClass()}`;
          translationSpan.textContent = ` (${rep.translation})`;

          range.surroundContents(originalWordWrapper);
          originalWordWrapper.after(translationSpan);
          originalWordWrapper.setAttribute('data-wxt-word-processed', 'true');
          this.glow(translationSpan);
        }
      }
    } catch (e) {
      throw e; // 抛出错误以被 processTextGroup 捕获并执行回退
    }
  }

  // =================================================================
  // Section 3: 智能回退替换 (Smart Fallback Replacement)
  // =================================================================

  private applyReplacementsInFallback(textGroup: { nodes: Text[], combinedText: string, container: Element }, replacements: any[], styleManager: any): void {
    let charCount = 0;
    for (const node of textGroup.nodes) {
      const nodeLength = node.textContent?.length || 0;
      const nodeStart = charCount;
      const nodeEnd = charCount + nodeLength;

      const nodeReplacements = replacements
        .filter(rep => {
          if (!rep.position) return false;
          const { start, end } = rep.position;
          return start < nodeEnd && end > nodeStart;
        })
        .map(rep => {
          const { start, end } = rep.position;
          return {
            ...rep,
            position: {
              start: Math.max(0, start - nodeStart),
              end: Math.min(nodeLength, end - nodeStart)
            }
          };
        });

      if (nodeReplacements.length > 0) {
        this.applyReplacementsToSingleNode(node, nodeReplacements, styleManager);
      }

      charCount = nodeEnd;
    }
  }

  private findRangeForReplacement(nodes: Text[], start: number, end: number): Range | null {
    let charCount = 0;
    let startNode: Text | null = null, endNode: Text | null = null;
    let startOffset = 0, endOffset = 0;

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

  private applyReplacementsToSingleNode(node: Text, replacements: any[], styleManager: any): void {
    let currentNode = node;
    // 从后往前处理，这样索引不会因文本节点分裂而失效
    for (let i = replacements.length - 1; i >= 0; i--) {
      const rep = replacements[i];
      if (!rep.position) continue;
      const { start, end } = rep.position;
      if (currentNode.length < end) continue;

      // 分裂文本节点以隔离出要替换的部分
      currentNode.splitText(end);
      const targetNode = currentNode.splitText(start);

      const originalWordWrapper = document.createElement('span');
      originalWordWrapper.className = 'wxt-original-word';
      originalWordWrapper.setAttribute('data-wxt-word-processed', 'true');
      originalWordWrapper.textContent = targetNode.textContent;

      const translationSpan = document.createElement('span');
      translationSpan.className = `wxt-translation-term ${styleManager.getCurrentStyleClass()}`;
      translationSpan.textContent = ` (${rep.translation})`;

      const parent = targetNode.parentNode;
      if (parent) {
        // 用包裹元素替换原始文本节点
        parent.replaceChild(originalWordWrapper, targetNode);
        // 在包裹元素后面插入翻译
        originalWordWrapper.after(translationSpan);
        this.glow(translationSpan);
      }

      // 更新 currentNode 以便下一次迭代
      const previousSibling = originalWordWrapper.previousSibling;
      if (previousSibling && previousSibling.nodeType === Node.TEXT_NODE) {
        currentNode = previousSibling as Text;
      } else {
        break; // 如果前面没有文本节点了，就跳出循环
      }
    }
  }

  private glow(element: Element | null | undefined): void {
    if (!element) return;
    element.classList.add('wxt-glow');
    element.addEventListener('animationend', () => {
      element.classList.remove('wxt-glow');
    }, { once: true });
  }
}