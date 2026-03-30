<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="pending" class="text-center py-20 text-gray-400">載入中...</div>

    <div v-else-if="error" class="text-center py-20 text-accent-failed">
      找不到此賽事。
    </div>

    <template v-else-if="tournament">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="text-sm text-gray-400 hover:text-primary transition-colors mb-4 inline-block">
          &larr; 回到賽事列表
        </NuxtLink>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          {{ tournament.name }}
        </h1>
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-400">
          <span v-if="tournament.registrationStatus === 'OPEN'" class="px-2 py-0.5 rounded-full text-xs font-bold bg-accent-success/20 text-accent-success">
            報名開放中
          </span>
          <span v-else-if="tournament.registrationStatus === 'UPCOMING'" class="px-2 py-0.5 rounded-full text-xs font-bold bg-accent-pending/20 text-accent-pending">
            即將開放報名
          </span>
          <span v-else class="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">
            報名已截止
          </span>
          <span v-if="tournament.registrationOpenAt">
            {{ formatDate(tournament.registrationOpenAt) }} ~ {{ formatDate(tournament.registrationCloseAt!) }}
          </span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="tournament.description" class="bg-surface-light border border-surface-border rounded-xl p-6 mb-6">
        <p class="text-gray-300 whitespace-pre-line">{{ tournament.description }}</p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <NuxtLink
          v-if="tournament.registrationStatus === 'OPEN'"
          :to="`/tournament/${tournament.slug}/register`"
          class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg transition-colors text-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          立即報名
        </NuxtLink>

        <NuxtLink
          :to="`/tournament/${tournament.slug}/teams`"
          class="inline-flex items-center justify-center gap-2 bg-surface-lighter hover:bg-surface-border text-white font-semibold px-6 py-3 rounded-lg border border-surface-border transition-colors text-center"
        >
          查看報名隊伍
        </NuxtLink>

        <a
          v-if="tournament.rulesPdfUrl"
          :href="pdfFullUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center justify-center gap-2 bg-surface-lighter hover:bg-surface-border text-white font-semibold px-6 py-3 rounded-lg border border-surface-border transition-colors text-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          下載規則 PDF
        </a>
      </div>

      <!-- Payment Info -->
      <div class="bg-surface-light border border-surface-border rounded-xl p-6">
        <h2 class="text-lg font-bold text-white mb-4">繳費資訊</h2>
        <div class="space-y-2 text-gray-300 text-sm">
          <p>報名完成後，請依以下方式繳費：</p>
          <div class="bg-surface rounded-lg p-4 mt-3 font-mono text-sm">
            <p>匯款完成後，請截圖並私訊主辦單位確認。</p>
            <p class="text-gray-500 mt-2">（詳細匯款帳號將由主辦方另行公告）</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Tournament } from '~/types'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

const { data: tournament, pending, error } = await useFetch<Tournament & { registrationStatus: string }>(`/tournaments/${slug}`, {
  baseURL: config.public.apiBase as string,
})

const pdfFullUrl = computed(() => {
  const path = tournament.value?.rulesPdfUrl
  if (!path) return null
  if (path.startsWith('/')) {
    const base = (config.public.apiBase as string).replace(/\/api$/, '')
    return `${base}${path}`
  }
  return path
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

useHead({
  title: tournament.value?.name ? `${tournament.value.name} - Airsoft Racing` : 'Airsoft Racing',
})
</script>
