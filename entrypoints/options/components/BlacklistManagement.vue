<template>
    <div class="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">Blacklist Management</h2>
        <p class="text-gray-600">
            Add website patterns to disable the extension. Supports glob patterns like
            <code>*://*.example.com/*</code>.
        </p>
        <div class="flex space-x-2">
            <input v-model="newPattern" @keyup.enter="addPattern" type="text" placeholder="e.g., *://github.com/*"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button @click="addPattern"
                class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Add
            </button>
        </div>
        <ul v-if="patterns.length > 0" class="space-y-2 mt-4">
            <li v-for="pattern in patterns" :key="pattern"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <code class="text-gray-700">{{ pattern }}</code>
                <button @click="removePattern(pattern)"
                    class="px-3 py-1 text-sm bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    Remove
                </button>
            </li>
        </ul>
        <div v-else class="text-center text-gray-500 pt-4">
            The blacklist is currently empty.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BlacklistManager } from '@/src/modules/options/blacklist/manager';

const manager = new BlacklistManager();
const patterns = ref<string[]>([]);
const newPattern = ref('');

onMounted(async () => {
    patterns.value = await manager.getPatterns();
});

const addPattern = async () => {
    if (newPattern.value.trim() === '') return;
    await manager.addPattern(newPattern.value.trim());
    patterns.value = await manager.getPatterns();
    newPattern.value = '';
};

const removePattern = async (pattern: string) => {
    await manager.removePattern(pattern);
    patterns.value = await manager.getPatterns();
};
</script>