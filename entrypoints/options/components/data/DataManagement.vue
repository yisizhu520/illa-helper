<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">数据管理</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">导出设置</h3>
          <p class="text-sm text-muted-foreground">
            将您当前的所有设置导出为一个JSON文件。您可以保存此文件作为备份，或在其他设备上导入。
          </p>
          <Button @click="exportSettings">
            <Download class="w-4 h-4 mr-2" />
            导出设置
          </Button>
        </div>

        <div class="border-t border-border pt-6 space-y-4">
          <h3 class="text-lg font-medium">导入设置</h3>
          <p class="text-sm text-muted-foreground">
            从JSON文件导入设置。请注意：这将覆盖您当前的所有设置。
          </p>
          <div class="flex items-center space-x-2">
            <Input
              id="import-file"
              type="file"
              @change="handleFileSelect"
              accept=".json"
              class="max-w-xs"
            />
            <Button @click="importSettings" :disabled="!selectedFile">
              <Upload class="w-4 h-4 mr-2" />
              确认导入
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-vue-next';

const storageManager = new StorageManager();
const selectedFile = ref<File | null>(null);

const emit = defineEmits<{
  saveMessage: [message: string, type?: 'success' | 'error'];
}>();

const exportSettings = async () => {
  try {
    const settings = await storageManager.getUserSettings();
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `illa-helper-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    emit('saveMessage', '设置已成功导出！', 'success');
  } catch (error) {
    console.error('Failed to export settings:', error);
    emit('saveMessage', '导出失败，请查看控制台获取详情。', 'error');
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const importSettings = async () => {
  if (!selectedFile.value) {
    emit('saveMessage', '请先选择一个文件。', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        throw new Error('无法读取文件内容。');
      }
      const newSettings = JSON.parse(result);
      // 在这里可以添加更严格的设置验证逻辑
      await storageManager.saveUserSettings(newSettings);
      emit(
        'saveMessage',
        '设置已成功导入！页面将重新加载以应用更改。',
        'success',
      );
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to import settings:', error);
      emit('saveMessage', '导入失败，文件格式可能不正确。', 'error');
    }
  };
  reader.onerror = () => {
    emit('saveMessage', '读取文件时发生错误。', 'error');
  };
  reader.readAsText(selectedFile.value);
};
</script>
