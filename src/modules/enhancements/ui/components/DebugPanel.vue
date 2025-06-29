<template>
  <div
    ref="debugPanelRef"
    class="illa-debug-panel"
    :style="panelStyle"
    :class="{ 'is-minimized': isMinimized }"
    style="z-index: 10001 !important;"
  >
    <div class="panel-header" @mousedown="startDrag">
      <span class="title">🔧 调试面板</span>
      <div class="actions">
        <button @click="toggleMinimize">{{ isMinimized ? '🔼' : '🔽' }}</button>
        <button @click="closePanel">✕</button>
      </div>
    </div>
    <div v-if="!isMinimized" class="panel-content">
      <div class="status-section">
        <h4>系统状态</h4>
        <p>增强系统: <span :class="statusClass">{{ isEnhancementEnabled ? '✅ 已启用' : '❌ 已禁用' }}</span></p>
        <p>已注册Providers: <strong>{{ providerNames.join(', ') || '无' }}</strong></p>
      </div>
      <div class="actions-section">
        <h4>手动触发</h4>
        <button @click="runAnalysis" :disabled="isProcessing">
          {{ isProcessing ? '分析中...' : '🚀 分析当前页面' }}
        </button>
      </div>
      <div class="log-section">
        <h4>结果日志 <button @click="clearLogs">清空</button></h4>
        <div class="log-output">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { EnhancementManager } from '@/src/modules/enhancements/core/EnhancementManager';

const props = defineProps<{
  enhancementManager: EnhancementManager;
}>();

const debugPanelRef = ref<HTMLElement>();
const isMinimized = ref(false);
const isProcessing = ref(false);
const logs = ref<{ time: string, message: string }[]>([]);

const panelPosition = ref({ x: Math.max(10, window.innerWidth - 370), y: Math.max(10, window.innerHeight - 420) });
const dragState = ref({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

const isEnhancementEnabled = computed(() => props.enhancementManager.getSettings().enhancementSettings.isEnhancementEnabled);
const statusClass = computed(() => isEnhancementEnabled.value ? 'status-enabled' : 'status-disabled');
const providerNames = computed(() => props.enhancementManager.getProviders().map(p => p.name));

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${panelPosition.value.x}px`,
  top: `${panelPosition.value.y}px`,
  transform: 'none'
}));

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ time, message });
  if (logs.value.length > 50) {
    logs.value.pop();
  }
};

const runAnalysis = async () => {
  isProcessing.value = true;
  addLog('手动分析开始...');
  
  try {
    const context = {
      elementId: 'manual-debug',
      element: document.body,
      text: document.body.innerText,
      pageUrl: window.location.href,
      pageType: 'other' as const,
    };
    
    const enhancements = await props.enhancementManager.enhanceContent(context);
    
    if (enhancements.length > 0) {
      addLog(`分析完成，发现 ${enhancements.length} 个增强点。`);
      enhancements.forEach(enh => {
        addLog(`  - [${enh.type}] ${enh.title}`);
        props.enhancementManager.showEnhancementTooltip(enh, document.body);
      });
    } else {
      addLog('分析完成，未发现可用的增强点。');
    }
  } catch (error: any) {
    addLog(`分析出错: ${error.message}`);
    console.error('Debug panel analysis error:', error);
  }
  
  isProcessing.value = false;
};

const clearLogs = () => {
  logs.value = [];
};

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

const closePanel = () => {
  debugPanelRef.value?.remove();
};

const startDrag = (event: MouseEvent) => {
  dragState.value = {
    isDragging: true,
    startX: event.clientX,
    startY: event.clientY,
    initialX: panelPosition.value.x,
    initialY: panelPosition.value.y,
  };
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', endDrag);
};

const handleDrag = (event: MouseEvent) => {
  if (!dragState.value.isDragging) return;
  const deltaX = event.clientX - dragState.value.startX;
  const deltaY = event.clientY - dragState.value.startY;
  panelPosition.value = {
    x: dragState.value.initialX + deltaX,
    y: dragState.value.initialY + deltaY,
  };
};

const endDrag = () => {
  dragState.value.isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
};

onMounted(() => {
  addLog('调试面板已加载。');
  // 确保面板位置在视窗内
  const maxX = window.innerWidth - 350;
  const maxY = window.innerHeight - 400;
  panelPosition.value = {
    x: Math.min(Math.max(10, panelPosition.value.x), maxX),
    y: Math.min(Math.max(10, panelPosition.value.y), maxY)
  };
  console.log('Debug panel position:', panelPosition.value);
});
</script>

<style scoped>
.illa-debug-panel {
  position: fixed;
  z-index: 10001;
  width: 350px;
  background: rgba(245, 245, 245, 0.9);
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font-family: monospace;
  font-size: 12px;
  color: #333;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease-in-out;
}

.illa-debug-panel.is-minimized {
  height: 40px;
  overflow: hidden;
}

.panel-header {
  padding: 8px 12px;
  background: #333;
  color: #fff;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.panel-header:active {
  cursor: grabbing;
}
.panel-header .title {
  font-weight: bold;
}
.panel-header .actions button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
}

.panel-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.status-section, .actions-section, .log-section {
  margin-bottom: 12px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 12px;
}
.status-section h4, .actions-section h4, .log-section h4 {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 8px;
  color: #555;
  display: flex;
  justify-content: space-between;
}
.status-section p {
  margin: 4px 0;
}
.status-enabled {
  color: green;
  font-weight: bold;
}
.status-disabled {
  color: red;
  font-weight: bold;
}

.actions-section button {
  width: 100%;
  padding: 8px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.actions-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.actions-section button:hover:not(:disabled) {
  background-color: #3730a3;
}
.log-section button {
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
}

.log-output {
  height: 150px;
  overflow-y: scroll;
  background: #fff;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.log-item {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
  padding: 2px 0;
}
.log-time {
  color: #999;
}
</style> 