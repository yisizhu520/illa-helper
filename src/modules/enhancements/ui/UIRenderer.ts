import { createApp, App as VueApp } from 'vue';
import type { Enhancement } from '../core/types';
import type {
  UIPosition,
  TooltipArrowPosition,
  ContainerLayout,
} from './components';
import EnhancementTooltip from './components/EnhancementTooltip.vue';
import EnhancementContainer from './components/EnhancementContainer.vue';
import DebugPanel from './components/DebugPanel.vue';
import type { EnhancementManager } from '../core/EnhancementManager';

/**
 * UI渲染引擎配置
 */
export interface UIRendererConfig {
  // 容器选择器，如果不指定则使用body
  containerSelector?: string;
  // 是否避免与翻译UI冲突
  avoidTranslationUI?: boolean;
  // Z-index基础值
  baseZIndex?: number;
  // 主题配置
  theme?: 'light' | 'dark' | 'auto';
  // 动画配置
  animations?: {
    enabled: boolean;
    duration: number;
  };
}

/**
 * 渲染的UI实例信息
 */
interface RenderedUI {
  id: string;
  type: 'tooltip' | 'container' | 'debug';
  element: HTMLElement;
  vueApp: VueApp;
  enhancement?: Enhancement;
  enhancements?: Enhancement[];
  position?: UIPosition;
  cleanup: () => void;
}

/**
 * 定位冲突检测结果
 */
interface PositionConflict {
  hasConflict: boolean;
  conflictElements: HTMLElement[];
  suggestedPosition?: UIPosition;
}

/**
 * 智能定位配置
 */
interface SmartPositioningConfig {
  preferredPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  offset: number;
  margin: number;
  viewport: {
    padding: number;
  };
}

/**
 * 增强功能UI渲染引擎
 * 负责在页面中智能渲染和管理增强功能的UI组件
 */
export class UIRenderer {
  private config: Required<UIRendererConfig>;
  private renderedUIs = new Map<string, RenderedUI>();
  private container: HTMLElement | null = null;
  private smartPositioning: SmartPositioningConfig;
  private enhancementManager?: EnhancementManager;

  constructor(config: UIRendererConfig = {}) {
    this.config = {
      containerSelector: config.containerSelector || 'body',
      avoidTranslationUI: config.avoidTranslationUI ?? true,
      baseZIndex: config.baseZIndex || 10000,
      theme: config.theme || 'auto',
      animations: config.animations || { enabled: true, duration: 200 },
    };

    this.smartPositioning = {
      preferredPosition: 'auto',
      offset: 12,
      margin: 8,
      viewport: {
        padding: 20,
      },
    };

    this.initialize();
  }

  /**
   * 设置 EnhancementManager 引用
   */
  public setEnhancementManager(manager: EnhancementManager): void {
    this.enhancementManager = manager;
  }

  /**
   * 初始化渲染器
   */
  private initialize(): void {
    this.container = document.querySelector(this.config.containerSelector);
    if (!this.container) {
      console.warn(
        `UIRenderer: Container not found: ${this.config.containerSelector}`,
      );
      this.container = document.body;
    }

    // 注入基础样式
    this.injectBaseStyles();

    // 监听主题变化
    if (this.config.theme === 'auto') {
      this.watchThemeChanges();
    }
  }

  /**
   * 渲染工具提示
   */
  public renderTooltip(
    enhancement: Enhancement,
    targetElement: HTMLElement,
    options: {
      showConfidence?: boolean;
      showPinButton?: boolean;
      maxWidth?: number;
    } = {},
  ): string {
    const id = `tooltip-${enhancement.id}`;

    // 如果已存在，先清理
    if (this.renderedUIs.has(id)) {
      this.cleanup(id);
    }

    // 计算智能定位
    const position = this.calculateSmartPosition(targetElement, 'tooltip');
    const arrowPosition = this.getArrowPosition(targetElement, position);

    // 创建容器元素
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'illa-tooltip-container';
    this.container!.appendChild(tooltipContainer);

    // 创建Vue应用
    const vueApp = createApp(EnhancementTooltip, {
      enhancement,
      visible: true,
      position,
      arrowPosition,
      showConfidence: options.showConfidence,
      showPinButton: options.showPinButton,
      maxWidth: options.maxWidth,
      onClose: () => this.cleanup(id),
      onPin: (pinned: boolean) => this.handleTooltipPin(id, pinned),
      onPositionUpdate: (newPosition: UIPosition) =>
        this.updateTooltipPosition(id, newPosition),
    });

    vueApp.mount(tooltipContainer);

    // 记录渲染信息
    const renderedUI: RenderedUI = {
      id,
      type: 'tooltip',
      element: tooltipContainer,
      vueApp,
      enhancement,
      position,
      cleanup: () => {
        vueApp.unmount();
        tooltipContainer.remove();
      },
    };

    this.renderedUIs.set(id, renderedUI);

    // 添加进入动画
    if (this.config.animations.enabled) {
      this.addEnterAnimation(tooltipContainer);
    }

    return id;
  }

  /**
   * 渲染增强容器
   */
  public renderContainer(
    enhancements: Enhancement[],
    options: {
      position?: UIPosition;
      layout?: ContainerLayout;
      maxWidth?: number;
      maxHeight?: number;
    } = {},
  ): string {
    const id = `container-${Date.now()}`;

    // 如果已存在容器，先清理
    const existingContainer = Array.from(this.renderedUIs.values()).find(
      (ui) => ui.type === 'container',
    );
    if (existingContainer) {
      this.cleanup(existingContainer.id);
    }

    // 计算定位
    const layout = options.layout || 'floating';
    let position = options.position;

    if (layout === 'floating' && !position) {
      // 为浮动容器计算智能定位
      position = this.calculateContainerPosition();
    }

    // 创建容器元素
    const containerElement = document.createElement('div');
    containerElement.className = 'illa-enhancement-container-wrapper';
    this.container!.appendChild(containerElement);

    // 创建Vue应用
    const vueApp = createApp(EnhancementContainer, {
      enhancements,
      visible: true,
      position,
      layout,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      onClose: () => this.cleanup(id),
      onHelpful: (enhancement: Enhancement) =>
        this.handleEnhancementHelpful(enhancement),
      onDismiss: (enhancement: Enhancement) =>
        this.handleEnhancementDismiss(enhancement),
      onMore: (enhancement: Enhancement) =>
        this.handleEnhancementMore(enhancement),
      onRefresh: () => this.handleContainerRefresh(),
      onClearAll: () => this.handleContainerClearAll(),
    });

    vueApp.mount(containerElement);

    // 记录渲染信息
    const renderedUI: RenderedUI = {
      id,
      type: 'container',
      element: containerElement,
      vueApp,
      enhancements,
      position,
      cleanup: () => {
        vueApp.unmount();
        containerElement.remove();
      },
    };

    this.renderedUIs.set(id, renderedUI);

    // 添加进入动画
    if (this.config.animations.enabled) {
      this.addEnterAnimation(containerElement);
    }

    return id;
  }

  /**
   * 更新容器内容
   */
  public updateContainer(
    containerId: string,
    enhancements: Enhancement[],
  ): void {
    const renderedUI = this.renderedUIs.get(containerId);
    if (!renderedUI || renderedUI.type !== 'container') {
      console.warn(`UIRenderer: Container not found: ${containerId}`);
      return;
    }

    // 通过Vue的响应式更新
    // 这里需要通过组件实例来更新props
    // 实际实现可能需要使用事件或者其他方式
    console.log('Updating container with new enhancements:', enhancements);
  }

  /**
   * 清理渲染的UI
   */
  public cleanup(id?: string): void {
    if (id) {
      const renderedUI = this.renderedUIs.get(id);
      if (renderedUI) {
        if (this.config.animations.enabled) {
          this.addExitAnimation(renderedUI.element, () => {
            renderedUI.cleanup();
            this.renderedUIs.delete(id);
          });
        } else {
          renderedUI.cleanup();
          this.renderedUIs.delete(id);
        }
      }
    } else {
      // 清理所有
      this.renderedUIs.forEach((renderedUI, uiId) => {
        renderedUI.cleanup();
      });
      this.renderedUIs.clear();
    }
  }

  /**
   * 计算智能定位
   */
  private calculateSmartPosition(
    targetElement: HTMLElement,
    uiType: 'tooltip' | 'container',
  ): UIPosition {
    const targetRect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 检测冲突
    const conflict = this.detectPositionConflicts(targetRect);

    if (conflict.hasConflict && conflict.suggestedPosition) {
      return conflict.suggestedPosition;
    }

    // 基础定位策略
    let x = targetRect.left;
    let y = targetRect.bottom + this.smartPositioning.offset;

    // 确保不超出视口
    const uiWidth = uiType === 'tooltip' ? 320 : 400;
    const uiHeight = uiType === 'tooltip' ? 200 : 300;

    // 水平调整
    if (x + uiWidth > viewportWidth - this.smartPositioning.viewport.padding) {
      x = viewportWidth - uiWidth - this.smartPositioning.viewport.padding;
    }
    if (x < this.smartPositioning.viewport.padding) {
      x = this.smartPositioning.viewport.padding;
    }

    // 垂直调整
    if (
      y + uiHeight >
      viewportHeight - this.smartPositioning.viewport.padding
    ) {
      // 尝试放在目标元素上方
      y = targetRect.top - uiHeight - this.smartPositioning.offset;
      if (y < this.smartPositioning.viewport.padding) {
        // 如果上方也不够，放在视口内最合适的位置
        y = this.smartPositioning.viewport.padding;
      }
    }

    return { x, y };
  }

  /**
   * 检测定位冲突
   */
  private detectPositionConflicts(targetRect: DOMRect): PositionConflict {
    const conflictElements: HTMLElement[] = [];

    // 检查是否与翻译UI冲突
    if (this.config.avoidTranslationUI) {
      const translationElements = document.querySelectorAll(
        [
          '.illa-tooltip', // 现有的翻译工具提示
          '.pronunciation-tooltip', // 发音工具提示
          '.floating-ball', // 浮动球
        ].join(', '),
      );

      translationElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (this.isRectsOverlapping(targetRect, rect)) {
          conflictElements.push(el as HTMLElement);
        }
      });
    }

    // 检查与其他增强UI的冲突
    this.renderedUIs.forEach((ui) => {
      const rect = ui.element.getBoundingClientRect();
      if (this.isRectsOverlapping(targetRect, rect)) {
        conflictElements.push(ui.element);
      }
    });

    return {
      hasConflict: conflictElements.length > 0,
      conflictElements,
      suggestedPosition:
        conflictElements.length > 0
          ? this.calculateAlternativePosition(targetRect, conflictElements)
          : undefined,
    };
  }

  /**
   * 判断两个矩形是否重叠
   */
  private isRectsOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  /**
   * 计算替代定位
   */
  private calculateAlternativePosition(
    targetRect: DOMRect,
    conflictElements: HTMLElement[],
  ): UIPosition {
    // 尝试不同的定位策略
    const strategies = [
      { x: targetRect.right + this.smartPositioning.offset, y: targetRect.top },
      {
        x: targetRect.left - 320 - this.smartPositioning.offset,
        y: targetRect.top,
      },
      {
        x: targetRect.left,
        y: targetRect.top - 200 - this.smartPositioning.offset,
      },
    ];

    for (const strategy of strategies) {
      const strategyRect = new DOMRect(strategy.x, strategy.y, 320, 200);
      const hasConflict = conflictElements.some((el) => {
        const rect = el.getBoundingClientRect();
        return this.isRectsOverlapping(strategyRect, rect);
      });

      if (!hasConflict) {
        return strategy;
      }
    }

    // 如果所有策略都有冲突，返回默认位置
    return {
      x: targetRect.left,
      y: targetRect.bottom + this.smartPositioning.offset,
    };
  }

  /**
   * 计算箭头位置
   */
  private getArrowPosition(
    targetElement: HTMLElement,
    position: UIPosition,
  ): TooltipArrowPosition {
    const targetRect = targetElement.getBoundingClientRect();

    if (position.y > targetRect.bottom) {
      return 'top';
    } else if (position.y + 200 < targetRect.top) {
      return 'bottom';
    } else if (position.x > targetRect.right) {
      return 'left';
    } else {
      return 'right';
    }
  }

  /**
   * 计算容器定位
   */
  private calculateContainerPosition(): UIPosition {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 默认放在右下角
    return {
      x: viewportWidth - 420 - this.smartPositioning.viewport.padding,
      y: viewportHeight - 620 - this.smartPositioning.viewport.padding,
    };
  }

  /**
   * 注入基础样式
   */
  private injectBaseStyles(): void {
    const styleId = 'illa-enhancement-ui-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .illa-tooltip-container,
      .illa-enhancement-container-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --illa-accent-color: #4f46e5;
      }

      /* 动画样式 */
      .illa-ui-enter {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
        transition: all ${this.config.animations.duration}ms ease-out;
      }

      .illa-ui-enter-active {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      .illa-ui-exit {
        opacity: 1;
        transform: scale(1) translateY(0);
        transition: all ${this.config.animations.duration}ms ease-in;
      }

      .illa-ui-exit-active {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }

      /* 深色主题 */
      @media (prefers-color-scheme: dark) {
        .illa-tooltip-container,
        .illa-enhancement-container-wrapper {
          --illa-accent-color: #6366f1;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 监听主题变化
   */
  private watchThemeChanges(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      // 主题变化时重新注入样式
      const existingStyle = document.getElementById(
        'illa-enhancement-ui-styles',
      );
      if (existingStyle) {
        existingStyle.remove();
      }
      this.injectBaseStyles();
    });
  }

  /**
   * 添加进入动画
   */
  private addEnterAnimation(element: HTMLElement): void {
    element.classList.add('illa-ui-enter');
    requestAnimationFrame(() => {
      element.classList.add('illa-ui-enter-active');
      element.classList.remove('illa-ui-enter');

      setTimeout(() => {
        element.classList.remove('illa-ui-enter-active');
      }, this.config.animations.duration);
    });
  }

  /**
   * 添加退出动画
   */
  private addExitAnimation(element: HTMLElement, callback: () => void): void {
    element.classList.add('illa-ui-exit');
    requestAnimationFrame(() => {
      element.classList.add('illa-ui-exit-active');
      element.classList.remove('illa-ui-exit');
    });

    setTimeout(() => {
      callback();
    }, this.config.animations.duration);
  }

  // 事件处理方法
  private handleTooltipPin(id: string, pinned: boolean): void {
    console.log(`Tooltip ${id} pinned: ${pinned}`);
  }

  private updateTooltipPosition(id: string, position: UIPosition): void {
    const renderedUI = this.renderedUIs.get(id);
    if (renderedUI) {
      renderedUI.position = position;
    }
  }

  private handleEnhancementHelpful(enhancement: Enhancement): void {
    console.log('Enhancement marked as helpful:', enhancement.id);
  }

  private handleEnhancementDismiss(enhancement: Enhancement): void {
    console.log('Enhancement dismissed:', enhancement.id);
  }

  private handleEnhancementMore(enhancement: Enhancement): void {
    console.log('Show more for enhancement:', enhancement.id);
  }

  private handleContainerRefresh(): void {
    console.log('Container refresh requested');
  }

  private handleContainerClearAll(): void {
    console.log('Container clear all requested');
  }

  /**
   * 渲染调试面板
   */
  public renderDebugPanel(): string {
    const id = 'debug-panel';

    // 如果已存在，先清理
    if (this.renderedUIs.has(id)) {
      this.cleanup(id);
      return id; // 切换显示/隐藏
    }

    if (!this.enhancementManager) {
      console.error('UIRenderer: EnhancementManager not set, cannot render debug panel');
      return '';
    }

    // 创建容器元素
    const debugContainer = document.createElement('div');
    debugContainer.className = 'illa-debug-panel-container';
    this.container!.appendChild(debugContainer);

    // 创建Vue应用
    const vueApp = createApp(DebugPanel, {
      enhancementManager: this.enhancementManager,
    });

    vueApp.mount(debugContainer);

    // 记录渲染信息
    const renderedUI: RenderedUI = {
      id,
      type: 'debug',
      element: debugContainer,
      vueApp,
      cleanup: () => {
        vueApp.unmount();
        debugContainer.remove();
      },
    };

    this.renderedUIs.set(id, renderedUI);

    // 添加进入动画
    if (this.config.animations.enabled) {
      this.addEnterAnimation(debugContainer);
    }

    console.log('Debug panel rendered');
    return id;
  }

  /**
   * 检查调试面板是否可见
   */
  public isDebugPanelVisible(): boolean {
    return this.renderedUIs.has('debug-panel');
  }

  /**
   * 销毁渲染器
   */
  public destroy(): void {
    this.cleanup();

    // 移除注入的样式
    const style = document.getElementById('illa-enhancement-ui-styles');
    if (style) {
      style.remove();
    }
  }
}
