<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">翻译服务设置</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="api-key">API密钥</Label>
          <Input id="api-key" type="password" v-model="settings.apiConfig.apiKey" placeholder="输入你的API密钥" />
        </div>
        <div class="space-y-2">
          <Label for="api-endpoint">API端点</Label>
          <Input id="api-endpoint" type="text" v-model="settings.apiConfig.apiEndpoint" placeholder="输入API端点" />
        </div>
        <div class="space-y-2">
          <Label for="user-level">单词熟悉度 (User Level: {{ settings.userLevel }})</Label>
          <Slider id="user-level" :model-value="[settings.userLevel]"
            @update:model-value="settings.userLevel = ($event || [1])[0]" :min="1" :max="5" :step="1" />
        </div>
        <div class="space-y-2">
          <Label for="replacement-rate">替换率 (Replacement Rate:
            {{ Math.round(settings.replacementRate * 100) }}%)</Label>
          <Slider id="replacement-rate" :model-value="[settings.replacementRate]" @update:model-value="
            settings.replacementRate = ($event || [0])[0]
            " :min="0" :max="1" :step="0.01" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import { UserSettings, DEFAULT_SETTINGS } from '@/src/modules/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const settings = ref<UserSettings>(DEFAULT_SETTINGS);
const storageManager = new StorageManager();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

onMounted(async () => {
  settings.value = await storageManager.getUserSettings();
});

watch(
  settings,
  async (newSettings) => {
    await storageManager.saveUserSettings(newSettings);
    emit('saveMessage', '设置已保存');
    browser.runtime.sendMessage({
      type: 'settings_updated',
      settings: newSettings,
    });
  },
  { deep: true },
);
</script>
