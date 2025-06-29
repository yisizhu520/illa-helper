import { IEnhancementProvider, ContentContext, Enhancement } from './types';
import { UniversalApiService } from '../../api/services/UniversalApiService';
import { UserSettings } from '../../types';
import { WritingAssistantProvider } from '../providers';
import { UIRenderer, UIRendererConfig } from '../ui';

/**
 * 增强管理器
 * 负责管理所有增强器的生命周期，协调内容处理、AI服务和UI渲染
 */
export class EnhancementManager {
  private providers: Map<string, IEnhancementProvider> = new Map();
  private isInitialized = false;
  private uiRenderer: UIRenderer;
  private activeEnhancements: Map<string, Enhancement> = new Map();

  constructor(
    private settings: UserSettings,
    private apiService: UniversalApiService,
    uiConfig?: UIRendererConfig,
  ) {
    // 初始化UI渲染器
    this.uiRenderer = new UIRenderer({
      avoidTranslationUI: true,
      theme: 'auto',
      animations: { enabled: true, duration: 200 },
      ...uiConfig,
    });

    // 设置EnhancementManager引用到UIRenderer
    this.uiRenderer.setEnhancementManager(this);

    this.initializeDefaultProviders();
  }

  /**
   * 初始化默认的增强功能提供者
   */
  private initializeDefaultProviders(): void {
    try {
      // 注册写作助手Provider
      const writingAssistant = new WritingAssistantProvider(this.apiService);
      this.registerProvider(writingAssistant);

      // 未来在此添加更多默认providers
      // const criticalThinking = new CriticalThinkingProvider(this.apiService);
      // this.registerProvider(criticalThinking);

      this.isInitialized = true;
      console.log('EnhancementManager: Default providers initialized');
    } catch (error) {
      console.error('Failed to initialize default providers:', error);
    }
  }

  /**
   * 注册一个增强功能提供者
   */
  public registerProvider(provider: IEnhancementProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`Provider with id "${provider.id}" is already registered.`);
      return;
    }

    this.providers.set(provider.id, provider);
    console.log(`Provider registered: ${provider.name} (${provider.id})`);
  }

  /**
   * 获取所有已注册的providers
   */
  public getProviders(): IEnhancementProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 获取特定的provider
   */
  public getProvider(id: string): IEnhancementProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    console.log('EnhancementManager: Cleaning up...');
    this.providers.clear();
    this.activeEnhancements.clear();
    this.uiRenderer.destroy();
    this.isInitialized = false;
  }

  /**
   * 核心方法：处理页面内容并生成增强建议
   */
  public async enhanceContent(context: ContentContext): Promise<Enhancement[]> {
    // 检查系统是否已初始化
    if (!this.isInitialized) {
      console.warn('EnhancementManager not initialized');
      return [];
    }

    // 检查全局开关是否开启
    if (!this.settings.enhancementSettings.isEnhancementEnabled) {
      return [];
    }

    const allEnhancements: Enhancement[] = [];
    let processedCount = 0;
    const maxEnhancements =
      this.settings.enhancementSettings.maxEnhancementsPerPage;

    // 遍历所有已注册的providers
    for (const provider of this.providers.values()) {
      // 达到最大增强数量限制时停止处理
      if (processedCount >= maxEnhancements) {
        break;
      }

      try {
        // 检查该provider的分类是否在用户启用列表中
        const isProviderEnabled = provider.categories.some((category) =>
          this.settings.enhancementSettings.enabledCategories.includes(
            category,
          ),
        );

        if (!isProviderEnabled) {
          continue;
        }

        // 根据频率设置随机决定是否处理
        if (Math.random() > this.settings.enhancementSettings.frequency) {
          continue;
        }

        // 检查该provider是否适用于当前内容
        if (await provider.isApplicable(context)) {
          console.log(`Applying provider: ${provider.name}`);

          const enhancements = await provider.enhance(context);
          if (enhancements && enhancements.length > 0) {
            allEnhancements.push(...enhancements);
            processedCount += enhancements.length;

            console.log(
              `Generated ${enhancements.length} enhancements from ${provider.name}`,
            );
          }
        }
      } catch (error) {
        console.error(`Error in provider ${provider.id}:`, error);
      }
    }

    return allEnhancements.slice(0, maxEnhancements);
  }

  /**
   * 更新设置
   */
  public updateSettings(newSettings: UserSettings): void {
    this.settings = newSettings;
    console.log('EnhancementManager: Settings updated');
  }

  /**
   * 获取当前设置
   */
  public getSettings(): UserSettings {
    return this.settings;
  }

  /**
   * 显示增强建议工具提示
   */
  public showEnhancementTooltip(
    enhancement: Enhancement,
    targetElement: HTMLElement,
    options?: {
      showConfidence?: boolean;
      showPinButton?: boolean;
      maxWidth?: number;
    },
  ): string {
    const tooltipId = this.uiRenderer.renderTooltip(
      enhancement,
      targetElement,
      options,
    );
    this.activeEnhancements.set(enhancement.id, enhancement);
    return tooltipId;
  }

  /**
   * 显示增强建议容器
   */
  public showEnhancementContainer(
    enhancements: Enhancement[],
    options?: {
      position?: { x: number; y: number };
      layout?: 'floating' | 'sidebar' | 'bottom';
      maxWidth?: number;
      maxHeight?: number;
    },
  ): string {
    const containerId = this.uiRenderer.renderContainer(enhancements, options);

    // 记录活动的增强建议
    enhancements.forEach((enhancement) => {
      this.activeEnhancements.set(enhancement.id, enhancement);
    });

    return containerId;
  }

  /**
   * 隐藏特定的UI元素
   */
  public hideUI(id?: string): void {
    this.uiRenderer.cleanup(id);
  }

  /**
   * 更新容器内容
   */
  public updateContainer(
    containerId: string,
    enhancements: Enhancement[],
  ): void {
    this.uiRenderer.updateContainer(containerId, enhancements);

    // 更新活动增强建议记录
    this.activeEnhancements.clear();
    enhancements.forEach((enhancement) => {
      this.activeEnhancements.set(enhancement.id, enhancement);
    });
  }

  /**
   * 获取活动的增强建议
   */
  public getActiveEnhancements(): Enhancement[] {
    return Array.from(this.activeEnhancements.values());
  }

  /**
   * 处理增强建议反馈
   */
  public handleEnhancementFeedback(
    enhancementId: string,
    feedback: 'helpful' | 'dismiss',
  ): void {
    const enhancement = this.activeEnhancements.get(enhancementId);
    if (!enhancement) {
      console.warn(`Enhancement not found: ${enhancementId}`);
      return;
    }

    console.log(`Enhancement ${enhancementId} marked as ${feedback}`);

    // 这里可以添加用户反馈的持久化存储逻辑
    // 比如发送到分析服务，或保存到本地存储

    if (feedback === 'dismiss') {
      this.activeEnhancements.delete(enhancementId);
    }
  }

  /**
   * 获取UI渲染器实例（用于高级自定义）
   */
  public getUIRenderer(): UIRenderer {
    return this.uiRenderer;
  }

  /**
   * 显示/隐藏调试面板
   */
  public toggleDebugPanel(): string {
    return this.uiRenderer.renderDebugPanel();
  }

  /**
   * 检查调试面板是否可见
   */
  public isDebugPanelVisible(): boolean {
    return this.uiRenderer.isDebugPanelVisible();
  }
}
