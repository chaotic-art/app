<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'

const props = defineProps<{
  files: MassMintFile[]
}>()

const emit = defineEmits<{
  fileClick: [file: MassMintFile]
}>()

const readyCount = computed(() => props.files.filter(f => f.name?.trim() && f.description?.trim()).length)
const warningCount = computed(() => props.files.filter(f => f.name?.trim() && !f.description?.trim()).length)
const errorCount = computed(() => props.files.filter(f => !f.name?.trim()).length)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-4 text-sm font-mono">
      <span class="text-green-600">{{ readyCount }} ready</span>
      <span v-if="warningCount > 0" class="text-amber-500">{{ warningCount }} warning{{ warningCount !== 1 ? 's' : '' }}</span>
      <span v-if="errorCount > 0" class="text-red-500">{{ errorCount }} error{{ errorCount !== 1 ? 's' : '' }}</span>
    </div>

    <div class="border border-border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-muted">
          <tr>
            <th class="text-left px-3 py-2 font-medium w-12" />
            <th class="text-left px-3 py-2 font-medium">
              Filename
            </th>
            <th class="text-left px-3 py-2 font-medium">
              Name
            </th>
            <th class="text-left px-3 py-2 font-medium">
              Description
            </th>
            <th class="text-left px-3 py-2 font-medium w-16">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in files"
            :key="file.id"
            class="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
            @click="emit('fileClick', file)"
          >
            <td class="px-3 py-2">
              <div class="w-8 h-8 rounded overflow-hidden bg-muted">
                <img
                  v-if="file.file.type?.startsWith('image/')"
                  :src="file.thumbnailUrl"
                  :alt="file.file.name"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-document" class="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </td>
            <td class="px-3 py-2 truncate max-w-[120px] font-mono text-xs">
              {{ file.file.name }}
            </td>
            <td class="px-3 py-2 truncate max-w-[150px]">
              {{ file.name || '—' }}
            </td>
            <td class="px-3 py-2 truncate max-w-[200px] text-muted-foreground">
              {{ file.description || '—' }}
            </td>
            <td class="px-3 py-2">
              <UTooltip
                v-if="!file.name?.trim()"
                text="Missing name — required to mint"
                :delay-duration="100"
                :ui="{ content: 'bg-red-500 text-white' }"
              >
                <UIcon
                  name="i-heroicons-x-circle"
                  class="w-5 h-5 text-red-500 hover:scale-110 transition-transform cursor-help"
                />
              </UTooltip>
              <UTooltip
                v-else-if="!file.description?.trim()"
                text="No description — can still mint"
                :delay-duration="100"
                :ui="{ content: 'bg-amber-500 text-white' }"
              >
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="w-5 h-5 text-amber-500 hover:scale-110 transition-transform cursor-help"
                />
              </UTooltip>
              <UTooltip
                v-else
                text="Ready to mint"
                :delay-duration="100"
                :ui="{ content: 'bg-green-600 text-white' }"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-5 h-5 text-green-500 hover:scale-110 transition-transform cursor-help"
                />
              </UTooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
