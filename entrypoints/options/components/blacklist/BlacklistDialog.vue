<template>
  <!-- 遮罩层 -->
  <div
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <!-- 对话框 -->
    <div
      class="bg-card border border-border rounded-lg shadow-lg w-full max-w-md"
      @click.stop
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h3 class="text-lg font-semibold text-foreground">
          {{ isEditing ? '编辑网站模式' : '添加网站模式' }}
        </h3>
        <button
          @click="handleCancel"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-6 space-y-4">
        <!-- 网站模式输入 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">
            网站模式
            <span class="text-destructive">*</span>
          </label>
          <input
            v-model="formData.url"
            @keyup.enter="handleSave"
            type="text"
            placeholder="例如: *://github.com/*"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            :class="{ 'border-destructive': urlError }"
            ref="urlInput"
          />
          <div v-if="urlError" class="text-sm text-destructive">
            {{ urlError }}
          </div>
        </div>

        <!-- 帮助信息 -->
        <div class="bg-muted/50 rounded-md p-4 space-y-2">
          <div class="text-sm font-medium text-foreground">支持的模式：</div>
          <div class="text-xs text-muted-foreground space-y-1">
            <div>
              <code>*://example.com/*</code>
              - 整个域名
            </div>
            <div>
              <code>https://example.com/path/*</code>
              - 特定路径
            </div>
            <div>
              <code>*://*.example.com/*</code>
              - 包含子域名
            </div>
            <div>
              <code>file:///*</code>
              - 本地文件
            </div>
          </div>
        </div>

        <!-- 预设模板 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">常用模板：</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in presets"
              :key="preset.pattern"
              @click="applyPreset(preset.pattern)"
              class="text-left p-2 border border-border rounded text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div class="font-medium">{{ preset.name }}</div>
              <div class="text-muted-foreground font-mono">
                {{ preset.pattern }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex items-center justify-end gap-2 p-6 border-t border-border"
      >
        <button
          @click="handleCancel"
          class="px-4 py-2 border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          取消
        </button>
        <button
          @click="handleSave"
          :disabled="!isFormValid"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isEditing ? '更新' : '添加' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { X } from 'lucide-vue-next';

interface BlacklistPattern {
  url: string;
  addedAt: Date;
  enabled: boolean;
}

interface Props {
  pattern?: BlacklistPattern | null;
  isEditing: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [pattern: BlacklistPattern];
  cancel: [];
}>();

const urlInput = ref<HTMLInputElement>();
const urlError = ref('');

const formData = reactive({
  url: '',
  enabled: true,
});

const presets = [
  { name: 'GitHub', pattern: '*://github.com/*' },
  { name: 'Stack Overflow', pattern: '*://stackoverflow.com/*' },
  { name: 'MDN', pattern: '*://developer.mozilla.org/*' },
  { name: 'Google Docs', pattern: '*://docs.google.com/*' },
];

onMounted(async () => {
  if (props.pattern) {
    formData.url = props.pattern.url;
    formData.enabled = props.pattern.enabled;
  }

  await nextTick();
  urlInput.value?.focus();
});

const isFormValid = computed(() => {
  return formData.url.trim() !== '' && !urlError.value;
});

const validateUrl = (url: string): boolean => {
  urlError.value = '';

  if (!url.trim()) {
    urlError.value = '请输入网站模式';
    return false;
  }

  // 基本的URL模式验证
  const patterns = [
    /^\*:\/\/.*/, // *://domain
    /^https?:\/\/.*/, // http://domain or https://domain
    /^file:\/\/.*/, // file://path
  ];

  const isValid = patterns.some((pattern) => pattern.test(url));

  if (!isValid) {
    urlError.value = '请输入有效的URL模式';
    return false;
  }

  return true;
};

const applyPreset = (pattern: string) => {
  formData.url = pattern;
  validateUrl(pattern);
};

const handleSave = () => {
  if (!validateUrl(formData.url)) {
    return;
  }

  const pattern: BlacklistPattern = {
    url: formData.url.trim(),
    addedAt: props.pattern?.addedAt || new Date(),
    enabled: formData.enabled,
  };

  emit('save', pattern);
};

const handleCancel = () => {
  emit('cancel');
};
</script>
