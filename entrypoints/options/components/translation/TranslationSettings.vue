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
          <Label for="api-model">AI模型</Label>
          <Input id="api-model" type="text" v-model="settings.apiConfig.model" placeholder="输入AI模型名称，如：gpt-4, gpt-3.5-turbo" />
        </div>
        <div class="space-y-2">
          <Label for="temperature">温度参数 (Temperature: {{ settings.apiConfig.temperature }})</Label>
          <Slider id="temperature" :model-value="[settings.apiConfig.temperature]"
            @update:model-value="settings.apiConfig.temperature = ($event || [0.7])[0]" :min="0" :max="2" :step="0.1" />
          <p class="text-sm text-muted-foreground">较低值更保守，较高值更创新</p>
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="enable-thinking">启用思考模式</Label>
            <p class="text-sm text-muted-foreground">让AI在翻译前进行思考推理</p>
          </div>
          <Switch id="enable-thinking" v-model="settings.apiConfig.enable_thinking" />
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
import { Switch } from '@/components/ui/switch';

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
