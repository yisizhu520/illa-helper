import type { IEnhancementProvider, ContentContext, Enhancement, EnhancementCategory } from '../core/types';
import type { UniversalApiService } from '../../api/services/UniversalApiService';

/**
 * 创意思维激发器
 * 识别创意内容场景，提供类比思考、延伸联想和反向思维建议
 */
export class CreativityProvider implements IEnhancementProvider {
  public readonly id = 'creativity';
  public readonly name = '创意思维激发器';
  public readonly description = '激发创意思维，提供类比联想、延伸思考和创新视角';
  public readonly categories: EnhancementCategory[] = ['creativity', 'thinking'];
  public readonly version = '1.0.0';

  constructor(private apiService: UniversalApiService) {}

  /**
   * 检查内容是否适用于创意思维激发
   */
  public async isApplicable(context: ContentContext): Promise<boolean> {
    const { text, elementType, url } = context;

    // 文本长度检查
    if (text.length < 80 || text.length > 1500) {
      return false;
    }

    // 检查是否包含创意性关键词
    const creativityKeywords = [
      // 中文关键词
      '故事', '案例', '比如', '例如', '想象', '假设', '如果', '创新', '设计',
      '灵感', '创意', '想法', '概念', '模式', '方法', '解决方案', '策略',
      '类比', '相似', '对比', '联想', '启发', '思考', '探索', '发现',
      // 英文关键词
      'story', 'case', 'example', 'imagine', 'suppose', 'what if', 'creative',
      'innovative', 'design', 'inspiration', 'idea', 'concept', 'pattern',
      'solution', 'strategy', 'analogy', 'similar', 'explore', 'discover'
    ];

    const hasCreativityContent = creativityKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    // 检查是否包含描述性或叙述性模式
    const narrativePatterns = [
      /曾经有.*/, /有一.*/, /在.*时候/, /通过.*方式/,
      /这让我想到.*/, /就像.*一样/, /可以比作.*/,
      /once upon/, /there was/, /imagine that/, /think of it as/i,
      /it's like/, /similar to/, /reminds me of/i
    ];

    const hasNarrativePattern = narrativePatterns.some(pattern =>
      pattern.test(text)
    );

    // 检查是否来自创意相关网站
    const creativeDomains = [
      'design', 'creative', 'art', 'innovation', 'startup', 'idea',
      'dribbble.com', 'behance.net', 'pinterest.com', 'medium.com'
    ];

    const hasCreativeDomain = creativeDomains.some(domain =>
      url.toLowerCase().includes(domain)
    );

    // 检查元素类型
    const relevantElements = ['article', 'section', 'main', 'div', 'p'];
    const hasRelevantElement = relevantElements.includes(elementType);

    return (hasCreativityContent || hasNarrativePattern) && 
           (hasCreativeDomain || hasRelevantElement);
  }

  /**
   * 生成创意思维激发增强
   */
  public async enhance(context: ContentContext): Promise<Enhancement[]> {
    try {
      const creativity = await this.generateCreativeInsights(context.text);
      const enhancements: Enhancement[] = [];

      if (creativity.analogies.length > 0) {
                 enhancements.push({
           id: `creativity-analogies-${Date.now()}`,
           type: 'creativity',
           title: '类比思考',
           content: this.formatAnalogies(creativity.analogies),
           confidence: creativity.confidence,
           context: context,
           metadata: {
             provider: this.id,
             analysisType: 'analogies',
             analogies: creativity.analogies,
           },
         });
      }

      if (creativity.extensions.length > 0) {
                 enhancements.push({
           id: `creativity-extensions-${Date.now()}`,
           type: 'creativity',
           title: '延伸思考',
           content: this.formatExtensions(creativity.extensions),
           confidence: creativity.confidence,
           context: context,
           metadata: {
             provider: this.id,
             analysisType: 'extensions',
             extensions: creativity.extensions,
           },
         });
      }

      if (creativity.alternatives.length > 0) {
                 enhancements.push({
           id: `creativity-alternatives-${Date.now()}`,
           type: 'thinking',
           title: '反向思维',
           content: this.formatAlternatives(creativity.alternatives),
           confidence: creativity.confidence,
           context: context,
           metadata: {
             provider: this.id,
             analysisType: 'alternative-perspectives',
             alternatives: creativity.alternatives,
           },
         });
      }

      if (creativity.applications.length > 0) {
                 enhancements.push({
           id: `creativity-applications-${Date.now()}`,
           type: 'creativity',
           title: '实际应用',
           content: this.formatApplications(creativity.applications),
           confidence: creativity.confidence,
           context: context,
           metadata: {
             provider: this.id,
             analysisType: 'practical-applications',
             applications: creativity.applications,
           },
         });
      }

      return enhancements;
    } catch (error) {
      console.error('Creativity enhancement failed:', error);
      return [];
    }
  }

  /**
   * 生成创意洞察
   */
  private async generateCreativeInsights(text: string): Promise<{
    analogies: Array<{ description: string; domain: string; similarity: string }>;
    extensions: Array<{ direction: string; idea: string; potential: string }>;
    alternatives: Array<{ perspective: string; insight: string }>;
    applications: Array<{ field: string; application: string; impact: string }>;
    confidence: number;
  }> {
    const prompt = `作为创意思维专家，请对以下内容进行创意分析：

文本内容：
"""
${text}
"""

请从以下角度进行分析：

1. 类比思考：
- 这个概念/故事可以类比为什么？
- 在哪些不同领域有相似的模式？
- 类比的相似点是什么？

2. 延伸思考：
- 可以从哪些方向延伸这个想法？
- 如果进一步发展会如何？
- 有什么潜在的可能性？

3. 反向思维：
- 从完全相反的角度看会如何？
- 如果颠倒某些假设会怎样？
- 有什么意想不到的视角？

4. 实际应用：
- 可以应用到哪些实际领域？
- 有什么具体的应用场景？
- 可能产生什么影响？

请以JSON格式返回分析结果。`;

    try {
      const response = await this.apiService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      return this.parseCreativityResponse(response, text);
    } catch (error) {
      console.error('Error generating creative insights:', error);
      return this.generateFallbackCreativity(text);
    }
  }

  /**
   * 解析创意分析响应
   */
  private parseCreativityResponse(response: string, originalText: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analogies: parsed.analogies || [],
          extensions: parsed.extensions || [],
          alternatives: parsed.alternatives || [],
          applications: parsed.applications || [],
          confidence: 0.8,
        };
      }
    } catch (error) {
      console.warn('Failed to parse creativity response, using fallback');
    }

    return this.generateFallbackCreativity(originalText);
  }

  /**
   * 生成降级创意分析
   */
  private generateFallbackCreativity(text: string): any {
    const analogies: any[] = [];
    const extensions: any[] = [];
    const alternatives: any[] = [];
    const applications: any[] = [];

    // 基础类比建议
    analogies.push({
      description: '生活中的相似现象',
      domain: '日常生活',
      similarity: '结构和模式的相似性'
    });

    // 基础延伸思考
    extensions.push({
      direction: '深入探索',
      idea: '进一步挖掘这个概念的深层含义',
      potential: '可能发现新的洞察'
    });

    // 基础反向思维
    alternatives.push({
      perspective: '相反的角度',
      insight: '从完全不同的视角重新审视这个问题'
    });

    // 基础应用场景
    applications.push({
      field: '教育领域',
      application: '可以作为教学案例或启发材料',
      impact: '帮助学习者更好地理解概念'
    });

    return {
      analogies,
      extensions,
      alternatives,
      applications,
      confidence: 0.6,
    };
  }

  /**
   * 格式化类比思考
   */
  private formatAnalogies(analogies: any[]): string {
    let content = '🔗 **类比思考**\n\n';
    
    analogies.forEach((analogy, index) => {
      content += `**${index + 1}. ${analogy.description}**\n`;
      content += `领域：${analogy.domain}\n`;
      content += `相似点：${analogy.similarity}\n\n`;
    });

    content += '💡 *思考这些类比可以帮助你从不同角度理解问题*';
    return content.trim();
  }

  /**
   * 格式化延伸思考
   */
  private formatExtensions(extensions: any[]): string {
    let content = '🚀 **延伸思考**\n\n';
    
    extensions.forEach((ext, index) => {
      content += `**${index + 1}. ${ext.direction}**\n`;
      content += `想法：${ext.idea}\n`;
      content += `潜力：${ext.potential}\n\n`;
    });

    content += '✨ *让思维不断延伸，发现更多可能性*';
    return content.trim();
  }

  /**
   * 格式化反向思维
   */
  private formatAlternatives(alternatives: any[]): string {
    let content = '🔄 **反向思维**\n\n';
    
    alternatives.forEach((alt, index) => {
      content += `**${index + 1}. ${alt.perspective}**\n`;
      content += `洞察：${alt.insight}\n\n`;
    });

    content += '🎯 *打破常规思维，发现意想不到的视角*';
    return content.trim();
  }

  /**
   * 格式化实际应用
   */
  private formatApplications(applications: any[]): string {
    let content = '🛠️ **实际应用**\n\n';
    
    applications.forEach((app, index) => {
      content += `**${index + 1}. ${app.field}**\n`;
      content += `应用：${app.application}\n`;
      content += `影响：${app.impact}\n\n`;
    });

    content += '💼 *将创意转化为实际价值*';
    return content.trim();
  }
} 