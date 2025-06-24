<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- 页面标题和描述 -->
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">网站黑名单管理</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">

        <div class="space-y-2">

          <p class="text-muted-foreground">
            管理不需要翻译功能的网站。支持使用通配符模式，如
            <code class="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-sm">
          *://github.com/*
        </code>
          </p>
        </div>

        <!-- 操作工具栏 -->
        <div class="bg-card rounded-lg border border-border p-4">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <!-- 搜索框 -->
            <div class="flex-1 max-w-md">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input v-model="searchQuery" type="text" placeholder="搜索网站模式..."
                  class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <!-- 操作按钮组 -->
            <div class="flex gap-2">
              <button @click="showAddDialog = true"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                <Plus class="w-4 h-4" />
                添加网站
              </button>

              <button v-if="selectedPatterns.length > 0" @click="bulkDeletePatterns"
                class="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                <Trash2 class="w-4 h-4" />
                删除选中 ({{ selectedPatterns.length }})
              </button>

              <button @click="exportPatterns"
                class="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                <Download class="w-4 h-4" />
                导出
              </button>

              <button @click="importPatterns"
                class="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                <Upload class="w-4 h-4" />
                导入
              </button>
            </div>
          </div>
        </div>

        <!-- 黑名单表格 -->
        <div class="bg-card rounded-lg border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted/50">
                <tr>
                  <th class="w-12 p-4">
                    <input v-model="selectAll" @change="handleSelectAll" type="checkbox"
                      class="rounded border-border focus:ring-ring" />
                  </th>
                  <th class="text-left p-4 font-medium text-foreground">
                    网站模式
                  </th>
                  <th class="text-left p-4 font-medium text-foreground">状态</th>
                  <th class="text-left p-4 font-medium text-foreground">
                    添加时间
                  </th>
                  <th class="text-right p-4 font-medium text-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pattern, index) in filteredPatterns" :key="pattern.url"
                  class="border-t border-border hover:bg-muted/25 transition-colors">
                  <td class="p-4">
                    <input v-model="selectedPatterns" :value="pattern.url" type="checkbox"
                      class="rounded border-border focus:ring-ring" />
                  </td>
                  <td class="p-4">
                    <code class="px-2 py-1 bg-muted rounded text-sm font-mono">
                  {{ pattern.url }}
                </code>
                  </td>
                  <td class="p-4">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      已启用
                    </span>
                  </td>
                  <td class="p-4 text-muted-foreground text-sm">
                    {{ formatDate(pattern.addedAt) }}
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="editPattern(pattern, index)"
                        class="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title="编辑">
                        <Edit3 class="w-4 h-4" />
                      </button>
                      <button @click="removePattern(pattern.url)"
                        class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="删除">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredPatterns.length === 0" class="text-center py-12">
            <Shield class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-medium text-foreground mb-2">
              {{ searchQuery ? '未找到匹配的网站' : '黑名单为空' }}
            </h3>
            <p class="text-muted-foreground mb-4">
              {{
                searchQuery ? '试试其他搜索关键词' : '开始添加不需要翻译功能的网站'
              }}
            </p>
            <button v-if="!searchQuery" @click="showAddDialog = true"
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <Plus class="w-4 h-4" />
              添加第一个网站
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="text-sm text-muted-foreground">
          共 {{ patterns.length }} 个网站模式
          <span v-if="searchQuery">
            ，显示 {{ filteredPatterns.length }} 个匹配结果
          </span>
        </div>

        <!-- 添加/编辑对话框 -->
        <BlacklistDialog v-if="showAddDialog" :pattern="editingPattern" :is-editing="!!editingPattern"
          @save="handleSavePattern" @cancel="handleCancelEdit" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  Shield,
  Edit3,
} from 'lucide-vue-next';
import { BlacklistManager } from '@/src/modules/options/blacklist/manager';
import BlacklistDialog from './BlacklistDialog.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlacklistPattern {
  url: string;
  addedAt: Date;
  enabled: boolean;
}

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

const manager = new BlacklistManager();
const patterns = ref<BlacklistPattern[]>([]);
const searchQuery = ref('');
const selectedPatterns = ref<string[]>([]);
const selectAll = ref(false);
const showAddDialog = ref(false);
const editingPattern = ref<BlacklistPattern | null>(null);

onMounted(async () => {
  await loadPatterns();
});

const loadPatterns = async () => {
  const rawPatterns = await manager.getPatterns();
  patterns.value = rawPatterns.map((url) => ({
    url,
    addedAt: new Date(), // 实际应该从存储中获取
    enabled: true,
  }));
};

const filteredPatterns = computed(() => {
  if (!searchQuery.value) return patterns.value;
  const query = searchQuery.value.toLowerCase();
  return patterns.value.filter((pattern) =>
    pattern.url.toLowerCase().includes(query),
  );
});

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedPatterns.value = filteredPatterns.value.map((p) => p.url);
  } else {
    selectedPatterns.value = [];
  }
};

const removePattern = async (pattern: string) => {
  if (confirm(`确定要删除 "${pattern}" 吗？`)) {
    await manager.removePattern(pattern);
    await loadPatterns();
    emit('saveMessage', '网站已从黑名单中移除');
  }
};

const bulkDeletePatterns = async () => {
  if (confirm(`确定要删除选中的 ${selectedPatterns.value.length} 个网站吗？`)) {
    for (const pattern of selectedPatterns.value) {
      await manager.removePattern(pattern);
    }
    selectedPatterns.value = [];
    selectAll.value = false;
    await loadPatterns();
    emit('saveMessage', '已删除选中的网站');
  }
};

const editPattern = (pattern: BlacklistPattern, index: number) => {
  editingPattern.value = { ...pattern };
  showAddDialog.value = true;
};

const handleSavePattern = async (pattern: BlacklistPattern) => {
  const isEditing = !!editingPattern.value;

  if (isEditing) {
    // 编辑模式：先删除旧的模式
    await manager.removePattern(editingPattern.value!.url);
  }

  // 添加新的模式
  await manager.addPattern(pattern.url);
  await loadPatterns();
  showAddDialog.value = false;
  editingPattern.value = null;

  emit('saveMessage', isEditing ? '网站模式已更新' : '网站已添加到黑名单');
};

const handleCancelEdit = () => {
  showAddDialog.value = false;
  editingPattern.value = null;
};

const exportPatterns = () => {
  try {
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      patterns: patterns.value.map((p) => ({
        url: p.url,
        addedAt: p.addedAt.toISOString(),
        enabled: p.enabled,
      })),
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blacklist-patterns-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    emit('saveMessage', `已导出 ${patterns.value.length} 个网站模式`);
  } catch (error) {
    console.error('导出失败:', error);
    emit('saveMessage', '导出失败，请重试');
  }
};

const importPatterns = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        let patternsToImport: string[] = [];

        // 检查导入数据格式
        if (Array.isArray(importedData)) {
          // 旧格式：直接是字符串数组
          patternsToImport = importedData.filter(
            (item) => typeof item === 'string',
          );
        } else if (
          importedData.patterns &&
          Array.isArray(importedData.patterns)
        ) {
          // 新格式：包含完整数据的对象
          patternsToImport = importedData.patterns
            .map((p: any) => p.url || p)
            .filter(Boolean);
        } else {
          throw new Error('无效的文件格式');
        }

        if (patternsToImport.length === 0) {
          emit('saveMessage', '导入文件中没有找到有效的网站模式');
          return;
        }

        // 检查重复项
        const existingPatterns = patterns.value.map((p) => p.url);
        const newPatterns = patternsToImport.filter(
          (pattern) => !existingPatterns.includes(pattern),
        );
        const duplicateCount = patternsToImport.length - newPatterns.length;

        // 导入新模式
        for (const pattern of newPatterns) {
          await manager.addPattern(pattern);
        }

        await loadPatterns();

        let message = `已导入 ${newPatterns.length} 个网站模式`;
        if (duplicateCount > 0) {
          message += `，跳过 ${duplicateCount} 个重复项`;
        }
        emit('saveMessage', message);
      } catch (error) {
        console.error('导入失败:', error);
        emit('saveMessage', '导入失败：文件格式无效或包含错误数据');
      }
    }
  };
  input.click();
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>
