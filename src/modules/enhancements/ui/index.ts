// UI渲染引擎
export { UIRenderer } from './UIRenderer';
export type { UIRendererConfig } from './UIRenderer';

// UI组件
export * from './components';

// UI相关类型
export interface EnhancementUIManager {
  renderer: UIRenderer;
  showTooltip(enhancement: Enhancement, targetElement: HTMLElement): string;
  showContainer(enhancements: Enhancement[]): string;
  hideUI(id?: string): void;
  cleanup(): void;
}

export interface UIThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  accentColor?: string;
  animations?: {
    enabled: boolean;
    duration: number;
  };
}

export interface UILayoutConfig {
  tooltipMaxWidth?: number;
  containerMaxWidth?: number;
  containerMaxHeight?: number;
  preferredLayout?: 'floating' | 'sidebar' | 'bottom';
  positioning?: {
    offset: number;
    margin: number;
    viewportPadding: number;
  };
}

import type { Enhancement } from '../core/types';
