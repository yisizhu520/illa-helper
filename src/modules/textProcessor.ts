import { ApiConfig } from './types';
import { PronunciationService } from './pronunciation/services/PronunciationService';
import { DEFAULT_PRONUNCIATION_CONFIG } from './pronunciation/config';
import { ContentSegmenter } from './processing/ContentSegmenter';
import { ProcessingCoordinator } from './processing/ProcessingCoordinator';
import { globalProcessingState } from './processing/ProcessingStateManager';
import { EnhancementManager } from './enhancements/core/EnhancementManager';
import type { Enhancement } from './enhancements/core/types';
import { UniversalApiService } from './api/services/UniversalApiService';
import { UserSettings } from './types';

/**
 * 文本处理模块
 * 负责遍历DOM，提取文本节点，并进行处理
 */

// 文本节点处理器
export class TextProcessor {
  private pronunciationService: PronunciationService;
  private contentSegmenter: ContentSegmenter;
  private processingCoordinator: ProcessingCoordinator;
  private enhancementManager?: EnhancementManager;
  private apiService: UniversalApiService;
  private userSettings: UserSettings;

  constructor(
    settings: UserSettings,
    apiService: UniversalApiService,
    enhancementManager?: EnhancementManager,
  ) {
    this.userSettings = settings;
    this.apiService = apiService;
    this.enhancementManager = enhancementManager;

    // 创建发音服务配置
    const pronunciationConfig = {
      ...DEFAULT_PRONUNCIATION_CONFIG,
      uiConfig: {
        ...DEFAULT_PRONUNCIATION_CONFIG.uiConfig,
        tooltipEnabled: settings.enablePronunciationTooltip,
      },
    };

    this.pronunciationService = new PronunciationService(
      pronunciationConfig,
      settings.apiConfigs.find(
        (c) => c.id === settings.activeApiConfigId,
      )?.config,
    );
    this.contentSegmenter = new ContentSegmenter();
    this.processingCoordinator = new ProcessingCoordinator(
      this.pronunciationService,
    );
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
        filter: blur(0) !important;
      }

      /* 增强a标签内学习模式的悬停支持 */
      a .wxt-original-word--learning:hover,
      a:hover .wxt-original-word--learning {
        filter: blur(0) !important;
      }

      /* 音标错误提示样式 */
      .wxt-phonetic-error {
        font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
        font-size: 13px;
        color: #ff9999;
        font-style: italic;
        font-weight: 500;
        background: linear-gradient(135deg, rgba(255, 153, 153, 0.1) 0%, rgba(255, 153, 153, 0.05) 100%);
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
        border: 1px solid rgba(255, 153, 153, 0.3);
        letter-spacing: 0.02em;
        opacity: 0.8;
      }

      /* 嵌套单词悬浮框标题行布局 */
      .wxt-word-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .wxt-word-title-row .wxt-word-main {
        flex: 1;
      }

      .wxt-word-title-row .wxt-accent-buttons {
        flex-shrink: 0;
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
  public async processRoot(root: Node, textReplacer: any): Promise<void> {
    console.log('🔄 TextProcessor.processRoot called');
    console.log('🔍 Enhancement manager available:', !!this.enhancementManager);
    console.log('🔍 Enhancement system enabled:', this.userSettings.enhancementSettings.isEnhancementEnabled);
    console.log('🔍 Enhancement settings:', this.userSettings.enhancementSettings);
    
    try {
      // 第一步：更新内容分段器配置
      this.contentSegmenter.updateConfig({
        maxSegmentLength: 400,
        minSegmentLength: 20,
        enableSmartBoundary: true,
        mergeSmallSegments: true,
      });

      // 第二步：使用智能分段器将根节点分割为内容段落
      const segments = this.contentSegmenter.segmentContent(root);
      console.log(`🔍 Content segmenter found ${segments.length} segments`);
      
      if (segments.length === 0) {
        console.log('❌ No segments found, exiting processRoot');
        return;
      }

      // 如果增强系统启用，则优先处理增强功能
      if (
        this.enhancementManager &&
        this.userSettings.enhancementSettings.isEnhancementEnabled
      ) {
        console.log('✅ Enhancement system is enabled, processing segments...');
        
        for (const segment of segments) {
          if (segment.element) {
            const segmentText = segment.textContent || segment.element.textContent || '';
            console.log('🔍 Processing segment:', {
              text: segmentText.substring(0, 100) + '...',
              textLength: segmentText.length,
              element: segment.element.tagName
            });
            
            const enhancements = await this.enhancementManager.enhanceContent({
              elementId: `segment-${Date.now()}-${Math.random()}`,
              element: segment.element as HTMLElement,
              text: segmentText,
              pageUrl: window.location.href,
              pageType: 'article', // TODO: Implement page type detection
            });

            // 渲染增强功能UI
            if (enhancements.length > 0) {
              console.log(
                `✅ Generated ${enhancements.length} enhancements for segment:`,
                enhancements,
              );

              // 根据增强类型决定渲染方式
              this.renderEnhancements(enhancements, segment.element as HTMLElement);
            } else {
              console.log('❌ No enhancements generated for this segment');
            }
          } else {
            console.log('⚠️ Segment has no element, skipping');
          }
        }
      } else {
        console.log('❌ Enhancement system not enabled or manager not available');
        console.log('  - Manager available:', !!this.enhancementManager);
        console.log('  - System enabled:', this.userSettings.enhancementSettings.isEnhancementEnabled);
      }

      // 如果翻译功能启用，则执行翻译处理
      if (this.userSettings.isEnabled) {
        // 第三步：使用处理协调器进行统一处理
        await this.processingCoordinator.processSegments(
          segments,
          textReplacer,
          this.userSettings.originalWordDisplayMode,
          this.userSettings.translationPosition,
          this.userSettings.showParentheses,
        );
      }
    } catch (_) {
      // 静默处理错误
    }
  }

  // =================================================================
  // Section 2: 配置管理和统计 (Configuration & Statistics)
  // =================================================================

  /**
   * 更新API配置
   * 支持运行时API配置更新，配置变更会立即生效
   */
  updateApiConfig(apiConfig: ApiConfig): void {
    try {
      if (this.pronunciationService) {
        this.pronunciationService.updateApiConfig(apiConfig);
      }
    } catch (_) {
      // 静默处理错误
    }
  }

  /**
   * 获取处理统计信息
   */
  getProcessingStats() {
    return {
      coordinator: this.processingCoordinator.getStats(),
      global: globalProcessingState.getProcessingStats(),
    };
  }

  /**
   * 重置处理统计信息
   */
  resetStats(): void {
    this.processingCoordinator.resetStats();
    globalProcessingState.reset();
  }

  // =================================================================
  // Section 3: 增强功能UI渲染 (Enhancement UI Rendering)
  // =================================================================

  /**
   * 渲染增强功能UI
   */
  private renderEnhancements(
    enhancements: Enhancement[],
    targetElement: Element,
  ): void {
    if (!this.enhancementManager) {
      return;
    }

    try {
      // 根据增强数量和类型决定渲染策略
      if (enhancements.length === 1) {
        // 单个增强：显示为工具提示
        const enhancement = enhancements[0];
        this.enhancementManager.showEnhancementTooltip(
          enhancement,
          targetElement as HTMLElement,
          {
            showConfidence: true,
            showPinButton: true,
            maxWidth: 320,
          },
        );
      } else {
        // 多个增强：显示为容器
        this.enhancementManager.showEnhancementContainer(enhancements, {
          layout: 'floating',
          maxWidth: 400,
          maxHeight: 500,
        });
      }

      // 添加视觉提示：为目标元素添加增强标识
      this.addEnhancementIndicator(targetElement as HTMLElement);
    } catch (error) {
      console.error('Failed to render enhancements:', error);
    }
  }

  /**
   * 为目标元素添加增强标识
   */
  private addEnhancementIndicator(element: HTMLElement): void {
    // 避免重复添加标识
    if (element.classList.contains('wxt-enhanced')) {
      return;
    }

    // 添加增强样式类
    element.classList.add('wxt-enhanced');

    // 添加微妙的视觉提示
    const originalPosition = element.style.position;
    const originalBackground = element.style.background;

    // 应用增强标识样式
    element.style.position = 'relative';
    element.style.background =
      'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)';
    element.style.borderLeft = '3px solid rgba(79, 70, 229, 0.3)';
    element.style.paddingLeft = '8px';
    element.style.borderRadius = '4px';
    element.style.transition = 'all 0.2s ease';

    // 添加悬停效果
    const handleMouseEnter = () => {
      element.style.background =
        'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%)';
      element.style.borderLeftColor = 'rgba(79, 70, 229, 0.5)';
    };

    const handleMouseLeave = () => {
      element.style.background =
        'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)';
      element.style.borderLeftColor = 'rgba(79, 70, 229, 0.3)';
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // 可选：添加点击事件来重新显示增强信息
    const handleClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      if (this.enhancementManager) {
        const activeEnhancements =
          this.enhancementManager.getActiveEnhancements();
        if (activeEnhancements.length > 0) {
          // 重新显示增强容器
          this.enhancementManager.showEnhancementContainer(activeEnhancements, {
            layout: 'floating',
            maxWidth: 400,
            maxHeight: 500,
          });
        }
      }
    };

    element.addEventListener('click', handleClick);

    // 存储清理函数以便后续移除
    (element as any)._enhancementCleanup = () => {
      element.classList.remove('wxt-enhanced');
      element.style.position = originalPosition;
      element.style.background = originalBackground;
      element.style.borderLeft = '';
      element.style.paddingLeft = '';
      element.style.borderRadius = '';
      element.style.transition = '';
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
      delete (element as any)._enhancementCleanup;
    };
  }

  /**
   * 清理所有增强功能UI和标识
   */
  public cleanupEnhancements(): void {
    try {
      // 清理EnhancementManager的UI
      if (this.enhancementManager) {
        this.enhancementManager.hideUI();
      }

      // 清理页面上的增强标识
      const enhancedElements = document.querySelectorAll('.wxt-enhanced');
      enhancedElements.forEach((element) => {
        const cleanup = (element as any)._enhancementCleanup;
        if (cleanup) {
          cleanup();
        }
      });
    } catch (error) {
      console.error('Failed to cleanup enhancements:', error);
    }
  }
}
