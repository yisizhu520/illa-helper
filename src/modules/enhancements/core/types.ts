// Types are defined here without imports to avoid circular dependencies

/**
 * 增强功能的类别
 */
export type EnhancementCategory =
  | 'writing'
  | 'thinking'
  | 'creativity'
  | 'vocabulary'
  | 'communication'
  | 'verification'
  | 'knowledge'
  | 'data'
  | 'time'
  | 'decision';

/**
 * 页面内容的上下文信息
 */
export interface ContentContext {
  elementId: string;
  element: HTMLElement;
  text: string;
  pageUrl: string;
  pageType: 'article' | 'social' | 'document' | 'other';
  language?: string;
  additionalData?: any;
}

/**
 * 单个增强结果的数据结构
 */
export interface Enhancement {
  id: string;
  type: EnhancementCategory;
  title: string;
  content: string;
  confidence: number;
  context: ContentContext;
}

/**
 * 增强功能提供者接口
 */
export interface IEnhancementProvider {
  // 唯一标识符
  readonly id: string;
  // 显示名称
  readonly name: string;
  // 功能描述
  readonly description: string;
  // 功能分类列表
  readonly categories: EnhancementCategory[];

  /**
   * 检查内容是否适用于此增强功能
   * @param context - 内容上下文
   * @returns 是否适用
   */
  isApplicable(context: ContentContext): Promise<boolean>;

  /**
   * 生成增强建议
   * @param context - 内容上下文
   * @returns 增强结果数组
   */
  enhance(context: ContentContext): Promise<Enhancement[]>;
}
