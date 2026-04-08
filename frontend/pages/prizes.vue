<template>
  <div class="min-h-screen bg-surface">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Title -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          獎品一覽
        </h1>
        <p class="text-gray-400 text-sm sm:text-base">
          感謝贊助商提供豐富獎品，為得名隊伍獻上最佳好禮！
        </p>
      </div>

      <!-- Tag filter -->
      <div v-if="allTags.length" class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          :class="!activeTagId
            ? 'bg-primary text-white'
            : 'bg-surface-light text-gray-400 hover:text-white'"
          class="px-4 py-1.5 rounded-full text-sm font-semibold border border-surface-border transition-colors"
          @click="activeTagId = ''"
        >
          全部
        </button>
        <button
          v-for="tag in allTags"
          :key="tag.id"
          :class="activeTagId === tag.id
            ? 'bg-primary text-white'
            : 'bg-surface-light text-gray-400 hover:text-white'"
          class="px-4 py-1.5 rounded-full text-sm font-semibold border border-surface-border transition-colors"
          @click="activeTagId = tag.id"
        >
          {{ tag.name }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-16 text-gray-400">載入中...</div>

      <!-- Prize grid -->
      <div v-else-if="filteredPrizes.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="p in filteredPrizes"
          :key="p.id"
          class="bg-surface-light border border-surface-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-200 group"
        >
          <!-- Image -->
          <div class="aspect-square bg-white/5 overflow-hidden">
            <img
              :src="`${apiBase}/prizes/${p.id}/image`"
              :alt="p.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start gap-2 mb-2">
              <h3 class="text-white font-bold text-sm leading-tight flex-1">{{ p.name }}</h3>
              <span
                v-if="p.prizeTag"
                class="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
              >
                {{ p.prizeTag.name }}
              </span>
            </div>
            <p v-if="p.description" class="text-gray-500 text-xs leading-relaxed line-clamp-2">
              {{ p.description }}
            </p>
            <p v-if="p.sponsor" class="text-gray-600 text-xs mt-2">
              贊助：{{ p.sponsor.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-16 text-gray-500">
        目前尚無獎品資訊，敬請期待！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prize, PrizeTag } from '~/types'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: prizes, pending } = await useFetch<Prize[]>('/prizes', {
  baseURL: apiBase,
})

const { data: allTags } = await useFetch<PrizeTag[]>('/prize-tags', {
  baseURL: apiBase,
  default: () => [],
})

const activeTagId = ref('')

const filteredPrizes = computed(() => {
  if (!prizes.value) return []
  if (!activeTagId.value) return prizes.value
  return prizes.value.filter(p => p.prizeTag?.id === activeTagId.value)
})

useHead({
  title: '獎品一覽 - 極限速度杯 Airsoft Racing',
  meta: [
    { name: 'description', content: '極限速度杯氣槍競速賽贊助獎品一覽，感謝各大贊助商提供豐富好禮！' },
  ],
})
</script>
