/**
 * 键盘快捷键管理器
 * 负责管理增强功能的全局快捷键
 */

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcuts {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private isEnabled = true;
  private boundHandler: (event: KeyboardEvent) => void;

  constructor() {
    this.boundHandler = this.handleKeyDown.bind(this);
    this.addEventListeners();
  }

  /**
   * 注册快捷键
   */
  public register(config: ShortcutConfig): void {
    const key = this.generateKey(config);
    this.shortcuts.set(key, config);
    console.log(`Keyboard shortcut registered: ${this.getDisplayName(config)}`);
  }

  /**
   * 取消注册快捷键
   */
  public unregister(config: Partial<ShortcutConfig>): void {
    const key = this.generateKey(config);
    if (this.shortcuts.delete(key)) {
      console.log(`Keyboard shortcut unregistered: ${this.getDisplayName(config)}`);
    }
  }

  /**
   * 启用/禁用快捷键系统
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 获取所有已注册的快捷键
   */
  public getShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 生成快捷键的唯一标识
   */
  private generateKey(config: Partial<ShortcutConfig>): string {
    const parts: string[] = [];
    
    if (config.ctrlKey) parts.push('ctrl');
    if (config.altKey) parts.push('alt');
    if (config.shiftKey) parts.push('shift');
    if (config.metaKey) parts.push('meta');
    if (config.key) parts.push(config.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * 获取快捷键的显示名称
   */
  private getDisplayName(config: Partial<ShortcutConfig>): string {
    const parts: string[] = [];
    
    if (config.ctrlKey) parts.push('Ctrl');
    if (config.altKey) parts.push('Alt');
    if (config.shiftKey) parts.push('Shift');
    if (config.metaKey) parts.push('Meta');
    if (config.key) parts.push(config.key.toUpperCase());

    return parts.join('+');
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // 忽略在输入框中的按键
    const target = event.target as HTMLElement;
    if (this.isInputElement(target)) return;

    const key = this.generateKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    });

    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.action();
      } catch (error) {
        console.error(`Error executing shortcut ${key}:`, error);
      }
    }
  }

  /**
   * 检查目标元素是否是输入元素
   */
  private isInputElement(element: HTMLElement): boolean {
    const inputElements = ['INPUT', 'TEXTAREA', 'SELECT'];
    const contentEditable = element.contentEditable === 'true';
    
    return inputElements.includes(element.tagName) || contentEditable;
  }

  /**
   * 添加事件监听器
   */
  private addEventListeners(): void {
    document.addEventListener('keydown', this.boundHandler, true);
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.boundHandler, true);
  }

  /**
   * 销毁快捷键管理器
   */
  public destroy(): void {
    this.removeEventListeners();
    this.shortcuts.clear();
  }
}

/**
 * 全局快捷键管理器实例
 */
export const globalShortcuts = new KeyboardShortcuts();

/**
 * 预定义的快捷键配置
 */
export const PREDEFINED_SHORTCUTS = {
  TOGGLE_ENHANCEMENTS: {
    key: 'h',
    ctrlKey: true,
    description: '切换显示/隐藏所有增强功能',
  },
  TOGGLE_DEBUG_PANEL: {
    key: 'd',
    ctrlKey: true,
    altKey: true,
    description: '切换显示/隐藏调试面板',
  },
  FOCUS_NEXT_ENHANCEMENT: {
    key: 'n',
    ctrlKey: true,
    altKey: true,
    description: '聚焦到下一个增强功能',
  },
  FOCUS_PREV_ENHANCEMENT: {
    key: 'p',
    ctrlKey: true,
    altKey: true,
    description: '聚焦到上一个增强功能',
  },
  CLOSE_ALL_TOOLTIPS: {
    key: 'Escape',
    description: '关闭所有工具提示',
  },
  PIN_CURRENT_TOOLTIP: {
    key: 'p',
    ctrlKey: true,
    description: '固定/取消固定当前工具提示',
  },
} as const; 