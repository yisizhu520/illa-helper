<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  EnhancementCategory,
} from '@/src/modules/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 定义发送消息事件
const emit = defineEmits<{
  saveMessage: [message: string];
}>();

// 设置状态
const settings = ref<UserSettings>(DEFAULT_SETTINGS);

// 增强功能分类配置
const enhancementCategories = [
  {
    key: 'writing' as EnhancementCategory,
    label: '写作能力',
    description: '文本质量分析和改进建议',
  },
  {
    key: 'thinking' as EnhancementCategory,
    label: '批判思维',
    description: '观点识别和逻辑谬误检测',
  },
  {
    key: 'creativity' as EnhancementCategory,
    label: '创意思维',
    description: '脱口秀段子、类比思维等延伸',
  },
  {
    key: 'vocabulary' as EnhancementCategory,
    label: '专业词汇',
    description: '按职业领域定制的术语解释',
  },
  {
    key: 'communication' as EnhancementCategory,
    label: '社交沟通',
    description: '语调分析和跨文化交流建议',
  },
  {
    key: 'verification' as EnhancementCategory,
    label: '信息验证',
    description: '虚假信息检测和可信度评估',
  },
  {
    key: 'knowledge' as EnhancementCategory,
    label: '知识连接',
    description: '概念关联和学习路径建议',
  },
  {
    key: 'data' as EnhancementCategory,
    label: '数据素养',
    description: '图表解读和统计分析指导',
  },
  {
    key: 'time' as EnhancementCategory,
    label: '时间管理',
    description: '阅读时间估算和内容优先级',
  },
  {
    key: 'decision' as EnhancementCategory,
    label: '决策支持',
    description: '决策因素提取和利弊分析',
  },
];

// 创建 StorageManager 实例
const storageManager = new StorageManager();

// 保存设置
const saveSettings = async () => {
  try {
    await storageManager.saveUserSettings(settings.value);
    emit('saveMessage', '智能增强设置已保存');
  } catch (error) {
    console.error('保存设置失败:', error);
    emit('saveMessage', '保存失败，请重试');
  }
};

// 监听设置变化并自动保存
watch(settings, saveSettings, { deep: true });

// 初始化加载设置
onMounted(async () => {
  try {
    settings.value = await storageManager.getUserSettings();
  } catch (error) {
    console.error('加载设置失败:', error);
    settings.value = DEFAULT_SETTINGS;
  }
});

// 切换分类状态
const toggleCategory = (category: EnhancementCategory) => {
  const currentCategories = new Set(
    settings.value.enhancementSettings.enabledCategories,
  );
  if (currentCategories.has(category)) {
    currentCategories.delete(category);
  } else {
    currentCategories.add(category);
  }
  settings.value.enhancementSettings.enabledCategories =
    Array.from(currentCategories);
};

// 检查分类是否启用
const isCategoryEnabled = (category: EnhancementCategory) => {
  return settings.value.enhancementSettings.enabledCategories.includes(
    category,
  );
};
</script>

<template>
  <div class="space-y-6">
    <!-- 主要开关卡片 -->
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">智能增强系统</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="enhancement-enabled">启用智能增强</Label>
            <p class="text-xs text-muted-foreground">
              开启后，将在阅读时提供写作、创意、思考等多维度辅助。
            </p>
          </div>
          <Switch
            id="enhancement-enabled"
            :model-value="settings.enhancementSettings.isEnhancementEnabled"
            @update:model-value="
              settings.enhancementSettings.isEnhancementEnabled = $event
            "
          />
        </div>

        <!-- 触发频率设置 -->
        <div
          v-if="settings.enhancementSettings.isEnhancementEnabled"
          class="border-t border-border pt-6 space-y-4"
        >
          <div class="space-y-2">
            <Label for="enhancement-frequency">
              增强触发频率 ({{
                Math.round(settings.enhancementSettings.frequency * 100)
              }}%)
            </Label>
            <p class="text-xs text-muted-foreground">
              控制智能增强功能的触发频率，避免过度干扰阅读体验。
            </p>
            <Slider
              id="enhancement-frequency"
              :model-value="[settings.enhancementSettings.frequency]"
              @update:model-value="
                settings.enhancementSettings.frequency = ($event || [0.3])[0]
              "
              :min="0.1"
              :max="1"
              :step="0.1"
            />
          </div>

          <!-- AI服务选择 -->
          <div class="space-y-2">
            <Label for="ai-service">AI服务提供商</Label>
            <p class="text-xs text-muted-foreground">
              选择用于智能增强的AI服务，请确保在翻译设置中已配置相应的API。
            </p>
            <Select
              :model-value="settings.enhancementSettings.aiService"
              @update:model-value="
                settings.enhancementSettings.aiService = $event
              "
            >
              <SelectTrigger>
                <SelectValue placeholder="选择AI服务" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 功能模块配置 -->
    <Card v-if="settings.enhancementSettings.isEnhancementEnabled">
      <CardHeader>
        <CardTitle>
          <h3 class="text-xl font-bold text-foreground">功能模块管理</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground mb-6">
          选择您希望启用的智能增强功能。每个功能都会在合适的时机提供相应的辅助信息。
        </p>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="category in enhancementCategories"
            :key="category.key"
            class="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="space-y-1 flex-1 mr-3">
                <Label
                  :for="`category-${category.key}`"
                  class="text-sm font-medium cursor-pointer"
                >
                  {{ category.label }}
                </Label>
                <p class="text-xs text-muted-foreground">
                  {{ category.description }}
                </p>
              </div>
              <Switch
                :id="`category-${category.key}`"
                :model-value="isCategoryEnabled(category.key)"
                @update:model-value="toggleCategory(category.key)"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 高级配置 -->
    <Card v-if="settings.enhancementSettings.isEnhancementEnabled">
      <CardHeader>
        <CardTitle>
          <h3 class="text-xl font-bold text-foreground">高级配置</h3>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="max-enhancements">每页最大增强数量</Label>
          <p class="text-xs text-muted-foreground">
            限制每个页面显示的增强信息数量，避免信息过载。
          </p>
          <Slider
            id="max-enhancements"
            :model-value="[settings.enhancementSettings.maxEnhancementsPerPage]"
            @update:model-value="
              settings.enhancementSettings.maxEnhancementsPerPage = ($event || [
                5,
              ])[0]
            "
            :min="1"
            :max="20"
            :step="1"
          />
          <div class="text-sm text-muted-foreground">
            当前值: {{ settings.enhancementSettings.maxEnhancementsPerPage }}
          </div>
        </div>

        <div class="border-t border-border pt-6">
          <div class="bg-muted/50 p-4 rounded-lg">
            <h4 class="text-sm font-medium mb-2">✨ 即将推出</h4>
            <ul class="text-xs text-muted-foreground space-y-1">
              <li>• 自定义增强规则编辑器</li>
              <li>• 增强效果统计和分析</li>
              <li>• 个性化学习偏好设置</li>
              <li>• 协作和分享功能</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
