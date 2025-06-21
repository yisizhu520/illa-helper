/**
 * 悬浮球管理器
 * 负责在页面上创建和管理翻译悬浮球
 */

import type { FloatingBallConfig, FloatingBallState } from '../types';
import { FLOATING_BALL_STYLES, DRAG_CONFIG } from '../config';

export class FloatingBallManager {
  private config: FloatingBallConfig;
  private state: FloatingBallState;
  private ballElement: HTMLElement | null = null;
  private dragStartY = 0;
  private ballStartY = 0;
  private onTranslateCallback?: () => void;
  private savePositionTimer: number | null = null;

  constructor(config: FloatingBallConfig) {
    this.config = config;
    this.state = {
      isDragging: false,
      isVisible: false,
      currentPosition: config.position,
    };
  }

  /**
   * 初始化悬浮球
   */
  init(onTranslate?: () => void): void {
    this.onTranslateCallback = onTranslate;

    if (this.config.enabled) {
      this.createBall();
      this.setupEventListeners();
      this.state.isVisible = true;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: FloatingBallConfig): void {
    const wasEnabled = this.config.enabled;
    this.config = config;
    this.state.currentPosition = config.position;

    if (config.enabled && !wasEnabled) {
      // 从禁用变为启用
      this.createBall();
      this.setupEventListeners();
      this.state.isVisible = true;
    } else if (!config.enabled && wasEnabled) {
      // 从启用变为禁用
      this.destroy();
      this.state.isVisible = false;
    } else if (config.enabled && this.ballElement) {
      // 更新样式
      this.updateBallStyle();
      // 确保位置精确
      this.calibratePosition();
    }
  }

  /**
   * 创建悬浮球元素
   */
  private createBall(): void {
    if (this.ballElement) {
      this.ballElement.remove();
    }

    this.ballElement = document.createElement('div');
    this.ballElement.className = 'wxt-floating-ball';
    this.ballElement.innerHTML = this.createBallIcon();
    this.ballElement.title = '点击翻译页面';

    this.updateBallStyle();
    document.body.appendChild(this.ballElement);
  }

  /**
   * 创建简洁图标
   */
  private createBallIcon(): string {
    const { iconSize } = FLOATING_BALL_STYLES;
    return `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 简洁双向箭头 -->
        <path d="M16 8L20 12L16 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 16L4 12L8 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 12H4" stroke="white" stroke-width="2" stroke-linecap="round"/>

        <!-- 简洁字符 -->
        <text x="8" y="8" fill="white" font-size="7" font-weight="bold" font-family="Arial">A</text>
        <text x="14" y="19" fill="white" font-size="7" font-weight="bold" font-family="Arial">文</text>
      </svg>
    `;
  }

  /**
   * 注入简洁动画样式
   */
  private injectPulseAnimation(): void {
    const animationId = 'wxt-floating-ball-animation';
    if (document.getElementById(animationId)) return;

    const style = document.createElement('style');
    style.id = animationId;
    style.textContent = `
      @keyframes wxt-floating-ball-pulse {
        0%, 100% {
          transform: translateY(-50%) scale(1);
        }
        50% {
          transform: translateY(-50%) scale(1.02);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 校准位置 - 确保位置准确性
   */
  private calibratePosition(): void {
    if (!this.ballElement) return;

    // 重新设置位置，确保精确对齐
    requestAnimationFrame(() => {
      if (this.ballElement) {
        this.ballElement.style.top = `${this.config.position}%`;
      }
    });
  }

  /**
   * 更新悬浮球样式
   */
  private updateBallStyle(): void {
    if (!this.ballElement) return;

    const { size, right, background, boxShadow, transition, zIndex } =
      FLOATING_BALL_STYLES;

    // 注入动画样式
    this.injectPulseAnimation();

    const styles = `
      position: fixed;
      right: ${right};
      top: ${this.config.position}%;
      width: ${size}px;
      height: ${size}px;
      background: ${background};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: ${boxShadow};
      opacity: ${this.config.opacity};
      z-index: ${zIndex};
      transition: ${transition};
      user-select: none;
      transform: translateY(-50%);
      animation: wxt-floating-ball-pulse 4s ease-in-out infinite;
    `;

    this.ballElement.style.cssText = styles;

    // 校准位置
    this.calibratePosition();
  }

  /**
   * 设置悬停效果
   */
  private setupHoverEffects(): void {
    if (!this.ballElement) return;

    const {
      hoverBackground,
      hoverBoxShadow,
      background,
      boxShadow,
      hoverScale,
      activeBackground,
      activeBoxShadow,
    } = FLOATING_BALL_STYLES;

    // 鼠标进入效果
    this.ballElement.addEventListener('mouseenter', () => {
      if (!this.state.isDragging && this.ballElement) {
        this.ballElement.style.background = hoverBackground;
        this.ballElement.style.transform = `translateY(-50%) scale(${hoverScale})`;
        this.ballElement.style.boxShadow = hoverBoxShadow;
      }
    });

    // 鼠标离开效果
    this.ballElement.addEventListener('mouseleave', () => {
      if (!this.state.isDragging && this.ballElement) {
        this.ballElement.style.background = background;
        this.ballElement.style.transform = 'translateY(-50%) scale(1)';
        this.ballElement.style.boxShadow = boxShadow;
      }
    });

    // 点击激活效果
    this.ballElement.addEventListener('mousedown', () => {
      if (this.ballElement) {
        this.ballElement.style.background = activeBackground;
        this.ballElement.style.boxShadow = activeBoxShadow;
      }
    });

    // 点击释放效果
    this.ballElement.addEventListener('mouseup', () => {
      if (!this.state.isDragging && this.ballElement) {
        setTimeout(() => {
          if (this.ballElement) {
            this.ballElement.style.background = hoverBackground;
            this.ballElement.style.boxShadow = hoverBoxShadow;
          }
        }, 150); // 短暂显示激活状态后恢复悬停状态
      }
    });
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.ballElement) return;

    // 悬停效果
    this.setupHoverEffects();

    // 点击事件
    this.ballElement.addEventListener('click', (e) => {
      if (!this.state.isDragging) {
        e.preventDefault();
        e.stopPropagation();
        this.handleTranslate();
      }
    });

    // 拖拽事件
    this.ballElement.addEventListener(
      'mousedown',
      this.handleMouseDown.bind(this),
    );
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 触摸事件支持
    this.ballElement.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this),
    );
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * 处理翻译
   */
  private handleTranslate(): void {
    if (this.onTranslateCallback && this.ballElement) {
      this.onTranslateCallback();

      // 显示翻译动画
      const { activeBackground, background } = FLOATING_BALL_STYLES;
      this.ballElement.style.background = activeBackground;

      setTimeout(() => {
        if (this.ballElement) {
          this.ballElement.style.background = background;
        }
      }, 1000);
    }
  }

  /**
   * 鼠标按下处理
   */
  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.state.isDragging = false;
    this.dragStartY = e.clientY;

    // 记录当前实际位置（像素值）
    if (this.ballElement) {
      const rect = this.ballElement.getBoundingClientRect();
      this.ballStartY = rect.top + rect.height / 2; // 球心的实际Y坐标
    }

    // 禁用过渡动画，防止拖拽时的干扰
    if (this.ballElement) {
      this.ballElement.style.transition = 'none';
    }
  }

  /**
   * 鼠标移动处理
   */
  private handleMouseMove(e: MouseEvent): void {
    // 如果鼠标没有按下，则不处理
    if (!this.ballElement || e.buttons !== 1) return;

    // 计算移动距离，如果超过阈值则开始拖拽
    const deltaY = Math.abs(e.clientY - this.dragStartY);
    if (deltaY > DRAG_CONFIG.threshold) {
      this.state.isDragging = true;
    }

    // 如果正在拖拽，则更新位置
    if (this.state.isDragging) {
      e.preventDefault();

      // 计算新位置（像素值）
      const moveY = e.clientY - this.dragStartY;
      const newPixelY = this.ballStartY + moveY;

      // 转换为百分比
      const windowHeight = window.innerHeight;
      const ballSize = FLOATING_BALL_STYLES.size;

      // 确保球不会超出屏幕边界
      const minPixelY = ballSize / 2;
      const maxPixelY = windowHeight - ballSize / 2;
      const clampedPixelY = Math.max(minPixelY, Math.min(maxPixelY, newPixelY));

      // 转换为百分比（基于球心位置）
      const newPositionPercent = (clampedPixelY / windowHeight) * 100;

      // 再次限制在配置范围内
      const finalPosition = Math.max(
        DRAG_CONFIG.minPosition,
        Math.min(DRAG_CONFIG.maxPosition, newPositionPercent),
      );

      this.config.position = finalPosition;
      this.state.currentPosition = finalPosition;
      this.ballElement.style.top = `${finalPosition}%`;
    }
  }

  /**
   * 鼠标释放处理
   */
  private handleMouseUp(): void {
    // 恢复过渡动画
    if (this.ballElement) {
      this.ballElement.style.transition = FLOATING_BALL_STYLES.transition;
    }

    if (this.state.isDragging) {
      // 最终校准位置
      this.calibratePosition();

      // 防抖保存位置到存储
      this.debouncedSavePosition();
    }

    // 延迟重置拖拽状态，防止误触点击事件
    setTimeout(() => {
      this.state.isDragging = false;
    }, 100);
  }

  /**
   * 触摸开始处理
   */
  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseDown({
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
        buttons: 1,
      } as MouseEvent);
    }
  }

  /**
   * 触摸移动处理
   */
  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseMove({
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault(),
        buttons: 1,
      } as MouseEvent);
    }
  }

  /**
   * 触摸结束处理
   */
  private handleTouchEnd(): void {
    this.handleMouseUp();
  }

  /**
   * 防抖保存位置
   */
  private debouncedSavePosition(): void {
    if (this.savePositionTimer) {
      clearTimeout(this.savePositionTimer);
    }

    this.savePositionTimer = window.setTimeout(() => {
      this.savePosition();
    }, 300); // 300ms 防抖
  }

  /**
   * 保存位置到存储
   */
  private async savePosition(): Promise<void> {
    try {
      const { StorageManager } = await import('../../storageManager');
      const storageManager = new StorageManager();
      const settings = await storageManager.getUserSettings();
      settings.floatingBall.position = this.config.position;
      await storageManager.saveUserSettings(settings);
    } catch (error) {
      console.error('保存悬浮球位置失败:', error);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): FloatingBallState {
    return { ...this.state };
  }

  /**
   * 销毁悬浮球
   */
  destroy(): void {
    if (this.ballElement) {
      this.ballElement.remove();
      this.ballElement = null;
    }

    // 清理定时器
    if (this.savePositionTimer) {
      clearTimeout(this.savePositionTimer);
      this.savePositionTimer = null;
    }

    // 清理动画样式
    const animationStyle = document.getElementById(
      'wxt-floating-ball-animation',
    );
    if (animationStyle) {
      animationStyle.remove();
    }

    this.state.isVisible = false;
    this.state.isDragging = false;
  }
}
