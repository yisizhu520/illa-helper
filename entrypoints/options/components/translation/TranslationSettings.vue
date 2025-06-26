<template>
  <div class="space-y-6">
    <!-- 当前配置选择 -->
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">翻译服务配置</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>当前活跃配置</Label>
          <Select
            v-model="settings.activeApiConfigId"
            @update:model-value="handleActiveConfigChange"
          >
            <SelectTrigger>
              <SelectValue placeholder="选择API配置" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="config in settings.apiConfigs"
                :key="config.id"
                :value="config.id"
              >
                {{ config.name }} ({{ config.provider }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 当前配置状态 -->
        <div v-if="activeConfig" class="p-3 bg-muted rounded-lg">
          <div class="text-sm space-y-1">
            <div>
              <strong>服务商：</strong>
              {{ activeConfig.provider }}
            </div>
            <div>
              <strong>模型：</strong>
              {{ activeConfig.config.model }}
            </div>
            <div class="truncate">
              <strong>端点：</strong>
              {{ activeConfig.config.apiEndpoint }}
            </div>
            <div>
              <strong>状态：</strong>
              <span
                :class="
                  activeConfig.config.apiKey
                    ? 'text-green-600'
                    : 'text-destructive'
                "
              >
                {{ activeConfig.config.apiKey ? '已配置' : '未配置API密钥' }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 配置管理 -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle>
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-foreground">管理配置</h2>
            <Button @click="showAddDialog = true" size="sm" variant="default">
              <PlusCircle class="h-4 w-4 mr-1" /> 添加配置
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <RadioGroup 
          :model-value="settings.activeApiConfigId"
          @update:model-value="(value) => { settings.activeApiConfigId = value; handleActiveConfigChange(); }"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="config in settings.apiConfigs" 
              :key="config.id"
              class="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
              :class="{ 'border-primary border-2': config.id === settings.activeApiConfigId }"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-1.5 min-w-0">
                  <ServerIcon v-if="config.provider.toLowerCase().includes('openai')" class="h-3.5 w-3.5 text-green-500" />
                  <CloudIcon v-else-if="config.provider.toLowerCase().includes('cloud')" class="h-3.5 w-3.5 text-blue-500" />
                  <GlobeIcon v-else class="h-3.5 w-3.5 text-primary" />
                  <h3 class="font-semibold text-sm truncate" :title="config.name">
                    {{ config.name }}
                  </h3>
                </div>
                <div class="flex items-center">
                  <RadioGroupItem :value="config.id" :id="`config-${config.id}`" />
                  <label :for="`config-${config.id}`" class="text-xs ml-1.5 text-muted-foreground cursor-pointer">
                    激活
                  </label>
                </div>
              </div>
              
              <div class="text-xs text-muted-foreground space-y-0.5 mb-2">
                <div class="flex items-center gap-1">
                  <HashIcon class="h-3 w-3" />
                  <span class="truncate" :title="config.provider">{{ config.provider }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <CodeIcon class="h-3 w-3" />
                  <span class="truncate" :title="config.config.model">{{ config.config.model }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <KeyIcon class="h-3 w-3" />
                  <span class="flex items-center">
                    <span 
                      class="inline-block w-1.5 h-1.5 rounded-full mr-1"
                      :class="config.config.apiKey ? 'bg-green-500' : 'bg-red-500'"
                    ></span>
                    {{ config.config.apiKey ? '已配置' : '未配置' }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-end pt-1 border-t border-border/40">
                <div class="flex items-center gap-1">
                  <Button @click="editConfig(config)" size="sm" variant="ghost" class="h-6 w-6 p-0">
                    <PencilIcon class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="!config.isDefault"
                    @click="deleteConfig(config.id)"
                    size="sm"
                    variant="ghost"
                    class="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon class="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div 
              v-if="settings.apiConfigs.length === 0" 
              class="rounded-lg border border-dashed p-6 text-center text-muted-foreground col-span-full"
            >
              <FolderOpenIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
              暂无配置，点击上方"添加配置"按钮创建
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>

    <!-- 配置对话框 -->
    <div
      v-if="showAddDialog || editingConfig"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="cancelEdit"
    >
      <Card
        class="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <CardHeader>
          <CardTitle>
            {{ editingConfig ? '编辑配置' : '添加新配置' }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>配置名称</Label>
            <Input v-model="configForm.name" placeholder="输入配置名称" />
          </div>

          <div class="space-y-2">
            <Label>服务提供商</Label>
            <Input
              v-model="configForm.provider"
              placeholder="如: openai, deepseek, silicon-flow"
            />
          </div>

          <div class="space-y-2">
            <Label>API端点</Label>
            <Input
              v-model="configForm.config.apiEndpoint"
              placeholder="https:/xxxxx/v1/chat/completions"
            />
          </div>

          <div class="space-y-2">
            <Label>API密钥</Label>
            <Input
              type="password"
              v-model="configForm.config.apiKey"
              placeholder="输入API密钥"
            />
          </div>

          <div class="space-y-2">
            <Label>模型名称</Label>
            <Input
              v-model="configForm.config.model"
              placeholder="gpt-4o-mini"
            />
          </div>

          <div class="space-y-2">
            <Label>温度参数 ({{ configForm.config.temperature }})</Label>
            <Slider
              :model-value="[configForm.config.temperature]"
              @update:model-value="updateTemperature"
              :min="0"
              :max="2"
              :step="0.1"
            />
          </div>

          <div class="flex items-center justify-between">
            <Label>启用思考模式</Label>
            <Switch v-model="configForm.config.enable_thinking" />
          </div>
        </CardContent>
        <CardFooter class="flex justify-end space-x-2">
          <Button @click="cancelEdit" variant="outline">取消</Button>
          <Button @click="saveConfig">
            {{ editingConfig ? '保存' : '添加' }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  ApiConfigItem,
  ApiConfig,
} from '@/src/modules/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  PlusCircle,
  CheckCircle2 as CheckCircle2Icon,
  Hash as HashIcon,
  Code as CodeIcon,
  Key as KeyIcon,
  Zap as ZapIcon,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  FolderOpen as FolderOpenIcon,
  Server as ServerIcon,
  Cloud as CloudIcon,
  Globe as GlobeIcon,
} from 'lucide-vue-next';

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
const storageManager = new StorageManager();

// 对话框状态
const showAddDialog = ref(false);
const editingConfig = ref<ApiConfigItem | null>(null);

// 配置表单
const configForm = ref<{
  name: string;
  provider: string;
  config: ApiConfig;
}>({
  name: '',
  provider: '',
  config: {
    apiKey: '',
    apiEndpoint: '',
    model: '',
    temperature: 0.7,
    enable_thinking: false,
    phraseEnabled: true,
  },
});

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

// 计算属性
const activeConfig = computed(() => {
  return settings.value.apiConfigs.find(
    (config) => config.id === settings.value.activeApiConfigId,
  );
});

const handleActiveConfigChange = async () => {
  try {
    await storageManager.setActiveApiConfig(settings.value.activeApiConfigId);

    // 重新加载完整设置以确保同步
    await loadSettings();

    emit('saveMessage', '活跃配置已更新');
    notifyConfigChange();
  } catch (error) {
    console.error('更新活跃配置失败:', error);
  }
};

const editConfig = (config: ApiConfigItem) => {
  editingConfig.value = config;
  configForm.value = {
    name: config.name,
    provider: config.provider,
    config: { ...config.config },
  };
};

const deleteConfig = async (configId: string) => {
  if (confirm('确定要删除这个配置吗？')) {
    try {
      await storageManager.removeApiConfig(configId);
      await loadSettings();
      emit('saveMessage', '配置已删除');
      notifyConfigChange();
    } catch (error) {
      console.error('删除配置失败:', error);
      alert('删除配置失败');
    }
  }
};

const updateTemperature = (value: number[] | undefined) => {
  configForm.value.config.temperature = (value && value[0]) || 0.7;
};

const saveConfig = async () => {
  if (!configForm.value.name || !configForm.value.config.apiKey) {
    alert('请填写配置名称和API密钥');
    return;
  }

  try {
    if (editingConfig.value) {
      await storageManager.updateApiConfig(
        editingConfig.value.id,
        configForm.value.name,
        configForm.value.config,
      );
      emit('saveMessage', '配置已更新');
    } else {
      await storageManager.addApiConfig(
        configForm.value.name,
        configForm.value.provider || 'custom',
        configForm.value.config,
      );
      emit('saveMessage', '配置已添加');
    }

    await loadSettings();
    cancelEdit();
    notifyConfigChange();
  } catch (error) {
    console.error('保存配置失败:', error);
    alert('保存配置失败');
  }
};

const cancelEdit = () => {
  showAddDialog.value = false;
  editingConfig.value = null;
  configForm.value = {
    name: '',
    provider: '',
    config: {
      apiKey: '',
      apiEndpoint: '',
      model: '',
      temperature: 0.7,
      enable_thinking: false,
      phraseEnabled: true,
    },
  };
};

const loadSettings = async () => {
  try {
    settings.value = await storageManager.getUserSettings();
  } catch (error) {
    console.error('加载设置失败:', error);
  }
};

const notifyConfigChange = () => {
  try {
    browser.runtime.sendMessage({
      type: 'settings_updated',
      settings: settings.value,
    });
  } catch (error) {
    console.error('通知配置更改失败:', error);
  }
};

onMounted(async () => {
  await loadSettings();
});
</script>
