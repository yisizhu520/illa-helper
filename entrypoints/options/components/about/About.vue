<template>
    <div class="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>
                    <h2 class="text-2xl font-bold text-foreground">关于 ILLA Helper</h2>
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center space-x-4">
                    <img src="/logo.png" alt="ILLA Helper Logo" class="w-16 h-16" />
                    <div>
                        <h3 class="text-lg font-semibold">ILLA Helper</h3>
                        <p class="text-sm text-muted-foreground">版本 {{ extensionVersion }}</p>
                    </div>
                </div>
                <div class="prose prose-sm max-w-none text-foreground">
                    <p>
                        感谢您使用 ILLA Helper！本扩展旨在通过沉浸式翻译、智能单词替换等功能，帮助您更高效地阅读和学习外语内容。
                    </p>
                    <p>
                        如果您有任何问题、建议或反馈，欢迎通过以下方式联系我们：
                    </p>
                    <ul>
                        <li>
                            <a href="https://github.com/illacloud/illa-helper/issues" target="_blank"
                                class="text-primary hover:underline">在 GitHub 上提出 Issue</a>
                        </li>
                    </ul>
                    <p>您的支持是我们不断改进的动力！</p>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const extensionVersion = ref('N/A');

onMounted(() => {
    // 在浏览器扩展中，我们可以通过 browser.runtime.getManifest() 获取 manifest.json 的内容
    try {
        const manifest = browser.runtime.getManifest();
        extensionVersion.value = manifest.version;
    } catch (error) {
        console.error("无法获取扩展版本号:", error);
        // 在非扩展环境或开发服务器中，这可能会失败。可以设置一个默认值。
        extensionVersion.value = 'DEV';
    }
});
</script>