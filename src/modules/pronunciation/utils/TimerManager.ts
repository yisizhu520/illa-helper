/**
 * 定时器管理器
 * 统一管理所有定时器，避免内存泄漏
 */

export class TimerManager {
  private timers = new Map<string, number>();

  /**
   * 设置定时器
   * @param key 定时器键名
   * @param callback 回调函数
   * @param delay 延迟时间（毫秒）
   */
  set(key: string, callback: () => void, delay: number): void {
    // 清除已存在的同名定时器
    this.clear(key);

    const timerId = window.setTimeout(() => {
      callback();
      this.timers.delete(key);
    }, delay);

    this.timers.set(key, timerId);
  }

  /**
   * 清除指定定时器
   * @param key 定时器键名
   */
  clear(key: string): void {
    const timerId = this.timers.get(key);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.timers.delete(key);
    }
  }

  /**
   * 清除所有定时器
   */
  clearAll(): void {
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  /**
   * 检查定时器是否存在
   * @param key 定时器键名
   */
  has(key: string): boolean {
    return this.timers.has(key);
  }

  /**
   * 获取当前定时器数量
   */
  size(): number {
    return this.timers.size;
  }

  /**
   * 获取所有定时器键名
   */
  keys(): string[] {
    return Array.from(this.timers.keys());
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll();
  }
}
