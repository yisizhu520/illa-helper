<template>
    <div class="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <!-- 顶部Logo区域 -->
        <div class="h-16 flex items-center px-6 border-b border-sidebar-border">
            <div class="flex items-center space-x-3">
                <img src="/assets/vue.svg" alt="logo" class="w-8 h-8" />
                <div>
                    <h1 class="text-lg font-semibold text-sidebar-foreground">ILLA Helper</h1>
                    <p class="text-xs text-sidebar-foreground/60">设置中心</p>
                </div>
            </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 px-4 py-6 overflow-y-auto">
            <div class="space-y-6">
                <!-- 基础功能组 -->
                <NavigationGroup title="基础功能" :items="basicFeatures" :current-section="currentSection"
                    @section-change="handleSectionChange" />

                <!-- 高级功能组 -->
                <NavigationGroup title="高级功能" :items="advancedFeatures" :current-section="currentSection"
                    @section-change="handleSectionChange" />

                <!-- 管理工具组 -->
                <NavigationGroup title="管理工具" :items="managementTools" :current-section="currentSection"
                    @section-change="handleSectionChange" />
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
import {
    Settings,
    Languages,
    Bot,
    Volume2,
    Monitor,
    Image,
    Type,
    Mic,
    Shield,
    Keyboard,
    Circle,
    Sliders,
    Download,
    Info
} from 'lucide-vue-next';
import NavigationGroup from './NavigationGroup.vue';

interface Props {
    currentSection: string;
}

interface NavigationItem {
    key: string;
    label: string;
    icon: any;
    description?: string;
}

defineProps<Props>();

const emit = defineEmits<{
    sectionChange: [section: string];
}>();

// 基础功能组
const basicFeatures: NavigationItem[] = [
    {
        key: 'basic',
        label: '基本设置',
        icon: Settings,
        description: '基础配置和用户偏好'
    },
    {
        key: 'translation',
        label: '翻译服务',
        icon: Languages,
        description: 'API配置和翻译策略'
    }
];


// 高级功能组
const advancedFeatures: NavigationItem[] = [
    {
        key: 'floating',
        label: '悬浮球',
        icon: Circle,
        description: '悬浮工具球配置'
    }
];

// 管理工具组
const managementTools: NavigationItem[] = [
    {
        key: 'blacklist',
        label: '黑名单',
        icon: Shield,
        description: '网站黑名单管理'
    },
    {
        key: 'import',
        label: '导入/导出',
        icon: Download,
        description: '配置备份和恢复'
    },
    {
        key: 'about',
        label: '关于',
        icon: Info,
        description: '版本信息和帮助'
    }
];

const handleSectionChange = (section: string) => {
    emit('sectionChange', section);
};
</script>