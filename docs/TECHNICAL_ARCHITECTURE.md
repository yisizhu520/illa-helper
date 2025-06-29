# 智能阅读增强系统 - 技术方案文档

## 📋 文档信息

- **项目名称**: 智能阅读增强系统 (Smart Reading Enhancement System)
- **版本**: v2.0.0
- **创建时间**: 2024年1月
- **文档类型**: 技术方案文档 (TSD)
- **目标受众**: 开发团队、架构师、技术负责人

## 🎯 总体架构设计

### 1. 架构目标
- **高可扩展性**: 能够快速集成新的增强功能
- **高性能**: 不影响用户正常的网页浏览体验
- **高可靠性**: 稳定的服务和优雅的错误处理
- **易于维护**: 清晰的模块划分和代码结构

### 2. 架构图

```mermaid
graph TD
    subgraph Browser Environment
        subgraph Content Script
            A[DOM Observer] --> B[Content Processor]
            B --> C[Enhancement Manager]
            C --> D{Enhancement Providers}
            D -- renders --> E[UI Components]
            E -- user interaction --> C
        end

        subgraph Background Script
            F[API Service Proxy] -- fetches --> G[External APIs]
            H[Centralized Storage] -- syncs --> I[User Settings]
            J[Message Hub]
        end

        subgraph Popup/Options UI (Vue3)
            K[Settings Panel] -- updates --> I
            I -- notifies --> J
        end
    end

    subgraph External Services
        G
    end
    
    J -- dispatches --> C
    C -- uses --> F
    A -- triggers --> B
```

### 3. 技术选型
- **前端框架**: Vue 3 + TypeScript
- **扩展框架**: WXT (WebExtension框架)
- **状态管理**: VueUse (共享状态)
- **UI库**: Tailwind CSS + Shadcn/Vue
- **AI服务**: 复用现有的 `UniversalApiService`
- **存储**: `browser.storage.sync` + `StorageManager`
- **代码规范**: ESLint + Prettier + Husky

## 🧩 核心模块设计

### 1. 增强功能核心 (`enhancements/core`)

#### 1.1 `IEnhancementProvider.ts`
```typescript
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
  // 功能分类
  readonly category: EnhancementCategory;

  /**
   * 判断当前内容是否适合应用此增强
   * @param context - 内容上下文
   * @returns 是否可增强
   */
  canEnhance(context: ContentContext): Promise<boolean>;

  /**
   * 生成增强建议
   * @param context - 内容上下文
   * @returns 增强结果
   */
  generateEnhancement(context: ContentContext): Promise<Enhancement>;

  /**
   * 渲染UI组件
   * @param enhancement - 增强结果
   * @param container - UI容器
   */
  renderUI(enhancement: Enhancement, container: HTMLElement): void;
  
  /**
   * 清理资源
   */
  cleanup(): void;
}
```

#### 1.2 `EnhancementManager.ts`
- **职责**: 
  - 管理所有增强器的生命周期
  - 协调内容处理和UI渲染
  - 缓存和性能优化
- **核心方法**:
  - `registerProvider(provider: IEnhancementProvider)`
  - `enhanceContent(root: HTMLElement)`
  - `updateSettings(settings: EnhancementSettings)`
  - `cleanupEnhancements()`

#### 1.3 `ContentContext.ts`
```typescript
export interface ContentContext {
  element: HTMLElement;       // 当前处理的DOM元素
  text: string;               // 元素内的文本
  pageUrl: string;            // 页面URL
  pageType: PageType;         // 页面类型（新闻、社交媒体等）
  userProfile: UserProfile;   // 用户画像
  apiService: UniversalApiService; // AI服务实例
}
```

### 2. 内容处理器 (`processing`)

#### 2.1 `ContentProcessor.ts`
- **职责**:
  - 遍历DOM树，识别有效内容节点
  - 调用 `ContentSegmenter` 进行智能分段
  - 为每个内容段落创建 `ContentContext`
  - 将上下文传递给 `EnhancementManager`
- **核心逻辑**:
  - 使用 `MutationObserver` 监听动态内容变化
  - 忽略代码块、脚本、样式等非内容元素
  - 节流和防抖处理，避免频繁触发

### 3. AI服务层 (`api`)
- **复用**: 完全复用现有的 `UniversalApiService`
- **扩展**:
  - **Prompt工程**: 为每个增强器设计专用的提示词模板
  - **成本控制**: 增加API调用频率和预算限制
  - **缓存策略**: 基于内容哈希和用户设置缓存AI结果

### 4. UI层 (`ui`)

#### 4.1 统一UI组件库
- **技术**: Vue 3 + Tailwind CSS + `lucide-vue-next`
- **组件**:
  - `EnhancementButton`: 统一的触发按钮
  - `EnhancementPanel`: 显示增强结果的面板
  - `SettingsCheckbox`: 功能开关
  - `DraggableList`: 自定义排序
  - `PromptEditor`: AI提示词编辑器

#### 4.2 设置页面 (`options`)
- **功能**:
  - 增强功能总开关
  - 按分类管理所有增强器
  - 启用/禁用单个增强器
  - 拖拽调整优先级
  - 用户自定义增强器创建界面

### 5. 数据模型 (`types`)

#### 5.1 `EnhancementSettings.ts`
```typescript
export interface EnhancementSettings {
  // 全局开关
  isEnhancementEnabled: boolean;
  
  // 启用的增强器ID列表
  enabledProviders: string[];
  
  // 各增强器的优先级排序
  providerOrder: string[];
  
  // 用户自定义的增强器配置
  customProviders: CustomProviderConfig[];
  
  // AI调用预算和频率限制
  apiLimits: {
    dailyCallLimit: number;
    requestsPerMinute: number;
  };
}
```

#### 5.2 `CustomProviderConfig.ts`
```typescript
export interface CustomProviderConfig {
  id: string;
  name: string;
  description: string;
  // 触发条件：基于CSS选择器和关键词
  trigger: {
    cssSelector: string;
    keywords?: string[];
  };
  // AI提示词模板
  promptTemplate: string;
  // UI显示模板
  uiTemplate: string;
}
```

## ⚙️ 工作流程

### 1. 初始化流程
1. `content.ts` 加载
2. `StorageManager` 获取 `EnhancementSettings`
3. 初始化 `EnhancementManager`
4. `EnhancementFactory` 创建并注册所有内置和自定义增强器
5. `ContentProcessor` 启动并监听DOM

### 2. 内容处理流程
1. `ContentProcessor` 检测到有效内容节点
2. 创建 `ContentContext` (包含文本、URL、用户信息)
3. 调用 `EnhancementManager.enhanceContent(context)`
4. `EnhancementManager` 遍历所有启用的 `IEnhancementProvider`
5. 并行调用 `provider.canEnhance(context)`
6. 对通过检查的 `provider`，调用 `provider.generateEnhancement(context)`
7. `generateEnhancement` 内部调用 `UniversalApiService` 获取AI结果
8. `EnhancementManager` 收集所有增强结果
9. 调用 `provider.renderUI()` 在页面上渲染UI组件

### 3. 自定义增强器流程
1. 用户在设置页面创建新的自定义增强器
2. `StorageManager` 保存 `CustomProviderConfig`
3. `EnhancementFactory` 根据配置动态创建一个 `CustomProvider` 实例
4. `EnhancementManager` 注册新的 `CustomProvider`
5. 新的增强器立即在当前页面生效

## ⚡ 性能优化策略

### 1. 延迟加载 (Lazy Loading)
- 只在用户启用时加载对应的 `Provider` 模块
- 使用动态 `import()` 实现模块的按需加载

### 2. 缓存机制 (Caching)
- **AI结果缓存**: 
  - Key: `hash(content + providerId + userSettings)`
  - 存储: `IndexedDB` 或 `localStorage`
  - TTL: 24小时或配置变更时失效
- **DOM处理缓存**: 
  - 标记已处理的DOM节点，避免重复分析

### 3. 异步和并行处理 (Async & Parallel)
- 所有IO和AI调用必须是异步的
- `Promise.all` 并行执行多个 `provider` 的 `canEnhance` 和 `generateEnhancement`

### 4. 请求节流和防抖 (Throttling & Debouncing)
- `MutationObserver` 的回调函数使用防抖处理
- `onscroll` 或 `onresize` 事件使用节流处理
- API调用增加队列和频率限制

### 5. 资源清理 (Garbage Collection)
- 在页面卸载或功能禁用时，`EnhancementManager` 必须调用所有 `provider.cleanup()`
- `cleanup()` 负责移除DOM元素、事件监听器和定时器

## 🔒 安全性考虑

### 1. AI提示词注入
- **措施**: 对用户输入内容进行严格的清理和转义
- **实现**: `DOMPurify` 或类似库处理所有插入到AI提示词的用户内容

### 2. 跨站脚本 (XSS)
- **措施**: 绝不使用 `innerHTML` 直接渲染AI返回内容
- **实现**:
  - 使用 `textContent` 渲染文本
  - 对需要富文本的场景，使用安全的Markdown解析器或自定义的渲染逻辑

### 3. API密钥保护
- **复用**: 继续使用现有的机制，将API调用通过`background`脚本代理
- **强化**: 增加对请求来源的验证，确保只有扩展自身可以调用代理

## 🗓️ 开发路线图

### 阶段1: 核心框架 (Sprint 1-2)
- **任务**:
  - 定义 `IEnhancementProvider` 和核心类型
  - 实现 `EnhancementManager`
  - 改造 `ContentProcessor`
  - 搭建新的设置页面UI框架
- **产出**: 一个可运行但没有具体功能的增强框架

### 阶段2: 首批功能 (Sprint 3-4)
- **任务**:
  - 实现 `WritingImprovementProvider`
  - 实现 `CreativityBoosterProvider`
  - 实现 `CriticalThinkingProvider`
  - 在设置页面集成功能开关
- **产出**: 3个核心增强功能可用

### 阶段3: 自定义能力 (Sprint 5)
- **任务**:
  - 实现 `CustomProviderFactory`
  - 开发自定义增强器创建界面
  - 实现基于模板的 `CustomProvider`
- **产出**: 用户可以创建自己的简单增强器

### 阶段4: 优化和扩展 (Sprint 6+)
- **任务**:
  - 实现其他内置增强器
  - 性能分析和优化
  - 用户反馈收集和迭代
  - 社区分享功能设计
- **产出**: 一个功能丰富且性能优越的智能增强平台

## ❓ 待解决问题
- **AI成本估算**: 需要对典型用户的API调用量进行估算
- **UI/UX设计**: 需要设计一个既强大又简洁的UI交互模型
- **向后兼容**: 如何平滑地将现有用户迁移到新架构

---

**文档状态**: Draft v1.0  
**下次更新**: Sprint 1结束后更新详细模块接口设计  
**相关文档**: [产品需求文档](./PRODUCT_REQUIREMENTS.md) 