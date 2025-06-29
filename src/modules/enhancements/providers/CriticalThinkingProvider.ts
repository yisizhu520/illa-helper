import type { IEnhancementProvider, ContentContext, Enhancement, EnhancementCategory } from '../core/types';
import type { UniversalApiService } from '../../api/services/UniversalApiService';

/**
 * 批判性思维训练器
 * 识别文本中的观点、论证结构，提供批判性分析训练
 */
export class CriticalThinkingProvider implements IEnhancementProvider {
  public readonly id = 'critical-thinking';
  public readonly name = '批判性思维训练器';
  public readonly description = '识别观点、分析论证结构、发现逻辑问题，培养批判性思维能力';
  public readonly categories: EnhancementCategory[] = ['thinking', 'verification'];
  public readonly version = '1.0.0';

  constructor(private apiService: UniversalApiService) {}

  /**
   * 检查内容是否适用于批判性思维训练
   */
  public async isApplicable(context: ContentContext): Promise<boolean> {
    const { text, elementType, url } = context;

    // 文本长度检查
    if (text.length < 100 || text.length > 2000) {
      return false;
    }

    // 检查是否包含论述性关键词
    const argumentativeKeywords = [
      // 中文关键词
      '认为', '观点', '主张', '论证', '证明', '因为', '所以', '因此', '由于',
      '显然', '毫无疑问', '事实上', '研究表明', '数据显示', '专家认为',
      '支持', '反对', '批评', '质疑', '争议', '辩论', '讨论',
      // 英文关键词
      'argue', 'claim', 'assert', 'evidence', 'prove', 'demonstrate',
      'because', 'therefore', 'thus', 'however', 'although', 'while',
      'support', 'oppose', 'criticism', 'debate', 'discussion', 'controversy'
    ];

    const hasArgumentativeContent = argumentativeKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    // 检查是否是新闻、评论、分析类内容
    const analyticalPatterns = [
      /据.*报道/,
      /.*分析认为/,
      /研究发现/,
      /调查显示/,
      /专家表示/,
      /评论[家员]/,
      /观察者/,
      /according to/i,
      /analysis shows/i,
      /study reveals/i,
      /expert says/i,
      /opinion/i,
      /editorial/i
    ];

    const hasAnalyticalPattern = analyticalPatterns.some(pattern =>
      pattern.test(text)
    );

    // 检查URL是否来自新闻、博客、论坛等平台
    const relevantDomains = [
      'news', 'blog', 'forum', 'opinion', 'editorial', 'analysis',
      'zhihu.com', 'weibo.com', 'douban.com', 'reddit.com', 'medium.com'
    ];

    const hasRelevantDomain = relevantDomains.some(domain =>
      url.toLowerCase().includes(domain)
    );

    // 检查元素类型
    const relevantElements = ['article', 'section', 'main', 'div'];
    const hasRelevantElement = relevantElements.includes(elementType);

    return (hasArgumentativeContent || hasAnalyticalPattern) && 
           (hasRelevantDomain || hasRelevantElement);
  }

  /**
   * 生成批判性思维训练增强
   */
  public async enhance(context: ContentContext): Promise<Enhancement[]> {
    try {
      const analysis = await this.analyzeArgumentStructure(context.text);
      const enhancements: Enhancement[] = [];

      if (analysis.viewpoints.length > 0) {
        enhancements.push({
          id: `critical-viewpoint-${Date.now()}`,
          type: 'thinking',
          title: '发现观点和立场',
          content: this.formatViewpointAnalysis(analysis.viewpoints),
          confidence: analysis.confidence,
          context: context,
          metadata: {
            provider: this.id,
            analysisType: 'viewpoint-identification',
            viewpoints: analysis.viewpoints,
          },
        });
      }

      if (analysis.argumentList.length > 0) {
        enhancements.push({
          id: `critical-argument-${Date.now()}`,
          type: 'thinking',
          title: '论证结构分析',
          content: this.formatArgumentAnalysis(analysis.argumentList),
          confidence: analysis.confidence,
          context: context,
          metadata: {
            provider: this.id,
            analysisType: 'argument-structure',
            argumentList: analysis.argumentList,
          },
        });
      }

      if (analysis.logicalIssues.length > 0) {
        enhancements.push({
          id: `critical-issues-${Date.now()}`,
          type: 'verification',
          title: '逻辑问题识别',
          content: this.formatLogicalIssues(analysis.logicalIssues),
          confidence: analysis.confidence,
          context: context,
          metadata: {
            provider: this.id,
            analysisType: 'logical-fallacies',
            issues: analysis.logicalIssues,
          },
        });
      }

      if (analysis.criticalQuestions.length > 0) {
        enhancements.push({
          id: `critical-questions-${Date.now()}`,
          type: 'thinking',
          title: '批判性思考问题',
          content: this.formatCriticalQuestions(analysis.criticalQuestions),
          confidence: analysis.confidence,
          context: context,
          metadata: {
            provider: this.id,
            analysisType: 'critical-questions',
            questions: analysis.criticalQuestions,
          },
        });
      }

      return enhancements;
    } catch (error) {
      console.error('Critical thinking analysis failed:', error);
      return [];
    }
  }

  /**
   * 分析文本的论证结构
   */
  private async analyzeArgumentStructure(text: string): Promise<{
    viewpoints: Array<{ statement: string; type: 'main' | 'supporting' | 'opposing' }>;
    argumentList: Array<{ premise: string; conclusion: string; strength: number }>;
    logicalIssues: Array<{ type: string; description: string; location: string }>;
    criticalQuestions: string[];
    confidence: number;
  }> {
    const prompt = `作为批判性思维专家，请分析以下文本的论证结构：

文本内容：
"""
${text}
"""

请按以下格式分析：

1. 观点识别：
- 主要观点/立场
- 支持性观点
- 反对/质疑的观点

2. 论证分析：
- 前提条件
- 结论
- 论证强度(1-10)

3. 逻辑问题识别：
- 可能的逻辑谬误
- 论证薄弱环节
- 遗漏的关键信息

4. 批判性思考问题：
- 针对论证的关键问题
- 需要进一步验证的点
- 替代解释或观点

请以JSON格式返回分析结果, 使用 "viewpoints", "argumentList", "logicalIssues", "criticalQuestions"作为根级别的键。`;

    try {
      const response = await this.apiService.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });

      // 解析AI响应，提取结构化数据
      return this.parseAnalysisResponse(response, text);
    } catch (error) {
      console.error('Error analyzing argument structure:', error);
      return this.generateFallbackAnalysis(text);
    }
  }

  /**
   * 解析AI分析响应
   */
  private parseAnalysisResponse(response: string, originalText: string): any {
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          viewpoints: parsed.viewpoints || [],
          argumentList: parsed.argumentList || [],
          logicalIssues: parsed.logicalIssues || [],
          criticalQuestions: parsed.criticalQuestions || [],
          confidence: 0.8,
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback parsing');
    }

    // 降级解析：从文本中提取信息
    return this.generateFallbackAnalysis(originalText);
  }

  /**
   * 生成降级分析结果
   */
  private generateFallbackAnalysis(text: string): any {
    const viewpoints: any[] = [];
    const argumentList: any[] = [];
    const logicalIssues: any[] = [];
    const criticalQuestions: string[] = [];

    // 简单的观点识别
    const sentences = text.split(/[.。!！?？]/);
    sentences.forEach(sentence => {
      if (sentence.includes('认为') || sentence.includes('主张')) {
        viewpoints.push({
          statement: sentence.trim(),
          type: 'main'
        });
      }
    });

    // 生成通用批判性问题
    criticalQuestions.push('这个观点的证据是否充分？');
    criticalQuestions.push('是否存在其他可能的解释？');
    criticalQuestions.push('作者是否有偏见或既得利益？');

    return {
      viewpoints,
      argumentList,
      logicalIssues,
      criticalQuestions,
      confidence: 0.6,
    };
  }

  /**
   * 格式化观点分析结果
   */
  private formatViewpointAnalysis(viewpoints: any[]): string {
    let content = '🔍 **观点分析**\n\n';
    
    const mainViewpoints = viewpoints.filter(v => v.type === 'main');
    const supportingViewpoints = viewpoints.filter(v => v.type === 'supporting');
    const opposingViewpoints = viewpoints.filter(v => v.type === 'opposing');

    if (mainViewpoints.length > 0) {
      content += '**主要观点：**\n';
      mainViewpoints.forEach((viewpoint, index) => {
        content += `${index + 1}. ${viewpoint.statement}\n`;
      });
      content += '\n';
    }

    if (supportingViewpoints.length > 0) {
      content += '**支持观点：**\n';
      supportingViewpoints.forEach((viewpoint, index) => {
        content += `• ${viewpoint.statement}\n`;
      });
      content += '\n';
    }

    if (opposingViewpoints.length > 0) {
      content += '**反对观点：**\n';
      opposingViewpoints.forEach((viewpoint, index) => {
        content += `• ${viewpoint.statement}\n`;
      });
    }

    return content.trim();
  }

  /**
   * 格式化论证分析结果
   */
  private formatArgumentAnalysis(argumentList: any[]): string {
    let content = '⚖️ **论证结构**\n\n';
    
    argumentList.forEach((arg, index) => {
      content += `**论证 ${index + 1}:**\n`;
      content += `前提：${arg.premise}\n`;
      content += `结论：${arg.conclusion}\n`;
      content += `强度：${'★'.repeat(Math.round(arg.strength / 2))}${'☆'.repeat(5 - Math.round(arg.strength / 2))} (${arg.strength}/10)\n\n`;
    });

    return content.trim();
  }

  /**
   * 格式化逻辑问题
   */
  private formatLogicalIssues(issues: any[]): string {
    let content = '⚠️ **可能的逻辑问题**\n\n';
    
    issues.forEach((issue, index) => {
      content += `${index + 1}. **${issue.type}**\n`;
      content += `   描述：${issue.description}\n`;
      if (issue.location) {
        content += `   位置：${issue.location}\n`;
      }
      content += '\n';
    });

    return content.trim();
  }

  /**
   * 格式化批判性思考问题
   */
  private formatCriticalQuestions(questions: string[]): string {
    let content = '❓ **批判性思考问题**\n\n';
    
    questions.forEach((question, index) => {
      content += `${index + 1}. ${question}\n`;
    });

    content += '\n💡 *思考这些问题有助于更深入地理解和评估文本内容。*';

    return content.trim();
  }
} 