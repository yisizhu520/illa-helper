/**
 * 简单的API速率限制器
 * 基于时间窗口控制每秒最大请求数
 */

// 速率限制时间窗口（毫秒）
const RATE_LIMIT_WINDOW_MS = 1000;
// 滑动窗口的额外缓冲时间，防止临界误差
const SLIDING_WINDOW_BUFFER_MS = 10;

/**
 * 简单速率限制器类
 * 使用滑动时间窗口记录最近1秒的请求
 */
export class SimpleRateLimiter {
  private requestTimes: number[] = [];
  private requestsPerSecond: number;
  private enabled: boolean;
  private executionQueue: Promise<any> = Promise.resolve(); // 用于串行化操作的队列

  constructor(requestsPerSecond: number = 0, enabled: boolean = true) {
    this.requestsPerSecond = Math.max(0, requestsPerSecond);
    this.enabled = enabled && requestsPerSecond > 0; // 0表示无限制
  }

  /**
   * 检查是否可以发送请求，如果不能则等待。
   * 此方法通过一个内部队列实现原子化，防止竞态条件。
   */
  async checkAndWait(): Promise<void> {
    const chainedPromise = this.executionQueue.then(async () => {
      if (!this.enabled) {
        return;
      }

      const now = Date.now();

      // 性能优化：使用队列操作代替filter，避免全量遍历
      while (
        this.requestTimes.length > 0 &&
        now - this.requestTimes[0] >= RATE_LIMIT_WINDOW_MS
      ) {
        this.requestTimes.shift(); // 移除过期的请求记录
      }

      // 如果当前秒内请求数已达上限，等待
      if (this.requestTimes.length >= this.requestsPerSecond) {
        const oldestRequest = this.requestTimes[0]; // 队列的第一个元素就是最早的请求
        const waitTime =
          RATE_LIMIT_WINDOW_MS -
          (now - oldestRequest) +
          SLIDING_WINDOW_BUFFER_MS;

        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // 等待后再次清理，以防在等待期间有更多请求过期
        const newNow = Date.now();
        while (
          this.requestTimes.length > 0 &&
          newNow - this.requestTimes[0] >= RATE_LIMIT_WINDOW_MS
        ) {
          this.requestTimes.shift();
        }
      }

      // 记录本次请求时间
      this.requestTimes.push(Date.now());
    });

    // 将新操作的完成状态链接到队列上，确保后续操作会等待它
    this.executionQueue = chainedPromise;

    return chainedPromise;
  }

  /**
   * 更新配置
   */
  updateConfig(requestsPerSecond: number, enabled: boolean = true): void {
    this.requestsPerSecond = Math.max(0, requestsPerSecond);
    this.enabled = enabled && requestsPerSecond > 0; // 0表示无限制
  }

  /**
   * 批量检查和执行请求
   * 严格串行执行所有请求，遵守速率限制
   */
  async executeBatch<T>(requestFunctions: (() => Promise<T>)[]): Promise<T[]> {
    if (!this.enabled || requestFunctions.length === 0) {
      // 如果禁用或没有请求，直接并发执行
      return Promise.all(requestFunctions.map((fn) => fn()));
    }

    const results: T[] = [];

    // 严格串行执行每个请求
    for (let i = 0; i < requestFunctions.length; i++) {
      // 先检查速率限制并等待
      await this.checkAndWait();

      // 执行请求
      const result = await requestFunctions[i]();
      results.push(result);
    }

    return results;
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    const now = Date.now();
    const recentRequests = this.requestTimes.filter(
      (time) => now - time < RATE_LIMIT_WINDOW_MS,
    );

    return {
      enabled: this.enabled,
      requestsPerSecond: this.requestsPerSecond,
      currentRequests: recentRequests.length,
      remainingRequests: Math.max(
        0,
        this.requestsPerSecond - recentRequests.length,
      ),
    };
  }
}

/**
 * 全局速率限制器管理
 */
class RateLimitManager {
  private limiters = new Map<string, SimpleRateLimiter>();

  /**
   * 获取或创建指定端点的限制器
   */
  getLimiter(
    endpoint: string,
    requestsPerSecond: number = 0,
    enabled: boolean = true,
  ): SimpleRateLimiter {
    if (!this.limiters.has(endpoint)) {
      this.limiters.set(
        endpoint,
        new SimpleRateLimiter(requestsPerSecond, enabled),
      );
    } else {
      // 更新已存在的限制器配置
      this.limiters.get(endpoint)!.updateConfig(requestsPerSecond, enabled);
    }
    return this.limiters.get(endpoint)!;
  }

  /**
   * 清除所有限制器
   */
  clear(): void {
    this.limiters.clear();
  }
}

// 全局管理器实例
export const rateLimitManager = new RateLimitManager();

/**
 * 调试辅助函数：打印所有速率限制器的状态
 */
export function debugRateLimiters(): void {
  console.log('[速率限制调试] 速率限制管理器已加载');
}
