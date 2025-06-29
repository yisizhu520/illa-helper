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
    // 获取页面文本并清理，排除调试面板本身
    const debugPanel = document.querySelector('.illa-debug-panel') as HTMLElement;
    if (debugPanel) {
      debugPanel.style.display = 'none';
    }
    
    const pageText = document.body.innerText;
    const cleanedText = pageText.replace(/\s+/g, ' ').trim();
    
    // 恢复调试面板显示
    if (debugPanel) {
      debugPanel.style.display = '';
    }
    
    addLog(`页面文本长度: ${pageText.length} 字符`);
    addLog(`清理后文本长度: ${cleanedText.length} 字符`);
    addLog(`文本前100字符: "${cleanedText.substring(0, 100)}..."`);
    
    const context = {
      elementId: 'manual-debug',
      element: document.body,
      text: cleanedText,
      pageUrl: window.location.href,
      pageType: 'other' as const,
    };
    
    addLog('开始调用 enhanceContent...');
    console.log('🔍 Debug: Context created:', context);
    
    const enhancements = await props.enhancementManager.enhanceContent(context);
    
    console.log('🔍 Debug: Enhancements result:', enhancements);
    addLog(`enhanceContent 返回 ${enhancements.length} 个结果`);
    
    if (enhancements.length > 0) {
      addLog(`分析完成，发现 ${enhancements.length} 个增强点。`);
      enhancements.forEach((enh, index) => {
        addLog(`  - [${enh.type}] ${enh.title}`);
        addLog(`    置信度: ${enh.confidence}`);
        console.log(`🔍 Debug: Enhancement ${index}:`, enh);
        props.enhancementManager.showEnhancementTooltip(enh, document.body);
      });
    } else {
      addLog('分析完成，未发现可用的增强点。');
      
      // 详细检查为什么没有增强点
      const providers = props.enhancementManager.getProviders();
      addLog(`当前注册的Providers数量: ${providers.length}`);
      providers.forEach(provider => {
        addLog(`  - ${provider.name} (${provider.id})`);
      });
      
      const settings = props.enhancementManager.getSettings();
      addLog(`增强系统启用状态: ${settings.enhancementSettings.isEnhancementEnabled}`);
      addLog(`触发频率: ${settings.enhancementSettings.frequency}`);
      addLog(`启用的分类: ${settings.enhancementSettings.enabledCategories.join(', ')}`);
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

// 提前声明测试接口函数
const createTestInterface = () => {
  const testInterface = async (text: string) => {
    console.log('✅ 调试面板测试接口被调用');
    addLog(`测试指定文本: "${text.substring(0, 50)}..."`);
    
    try {
      const context = {
        elementId: 'test-specific',
        element: document.body,
        text: text,
        pageUrl: window.location.href,
        pageType: 'other' as const,
      };
      
      console.log('🔍 调用 enhanceContent 分析文本...');
      const enhancements = await props.enhancementManager.enhanceContent(context);
      console.log('🔍 分析结果:', enhancements);
      
      if (enhancements.length > 0) {
        addLog(`✅ 发现 ${enhancements.length} 个增强点`);
        enhancements.forEach((enh, index) => {
          addLog(`  - [${enh.type}] ${enh.title}`);
          console.log(`Enhancement ${index}:`, enh);
        });
      } else {
        addLog(`❌ 未发现增强点`);
      }
    } catch (error: any) {
      addLog(`❌ 测试出错: ${error.message}`);
      console.error('测试出错:', error);
    }
  };
  
  return testInterface;
};

onMounted(() => {
  console.log('🔄 DebugPanel onMounted 开始执行...');
  
  try {
    addLog('调试面板已加载。');
    
    // 确保面板位置在视窗内
    const maxX = window.innerWidth - 350;
    const maxY = window.innerHeight - 400;
    panelPosition.value = {
      x: Math.min(Math.max(10, panelPosition.value.x), maxX),
      y: Math.min(Math.max(10, panelPosition.value.y), maxY)
    };
    console.log('Debug panel position:', panelPosition.value);
    
    // 设置全局测试接口
    console.log('🔄 正在设置全局测试接口...');
    (window as any).debugPanelTest = createTestInterface();
    
    // 验证接口是否设置成功
    if ((window as any).debugPanelTest) {
      console.log('✅ 调试面板测试接口设置成功');
      console.log('✅ 调试面板初始化完成，测试接口已设置');
    } else {
      console.error('❌ 调试面板测试接口设置失败');
    }
    
    // 额外确认一次
    setTimeout(() => {
      if ((window as any).debugPanelTest) {
        console.log('✅ 延迟验证：测试接口确认存在');
      } else {
        console.error('❌ 延迟验证：测试接口仍然不存在');
      }
    }, 50);
    
  } catch (error) {
    console.error('❌ DebugPanel onMounted 执行出错:', error);
    addLog(`初始化出错: ${error}`);
  }
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