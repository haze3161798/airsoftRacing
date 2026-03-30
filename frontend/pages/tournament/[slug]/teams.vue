<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <NuxtLink :to="`/tournament/${slug}`" class="text-sm text-gray-400 hover:text-primary transition-colors mb-6 inline-block">
      &larr; 返回賽事頁面
    </NuxtLink>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-8">報名隊伍一覽</h1>

    <div v-if="pending" class="text-center py-12 text-gray-400">載入中...</div>

    <div v-else-if="error" class="text-center py-12 text-accent-failed">
      無法載入資料，請稍後再試。
    </div>

    <template v-else>
      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
            activeFilter === f.value
              ? 'bg-primary text-white'
              : 'bg-surface-light text-gray-400 hover:bg-surface-lighter border border-surface-border'
          ]"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="ml-1 text-xs opacity-70">({{ f.count }})</span>
        </button>
      </div>

      <!-- Teams table -->
      <div v-if="filteredTeams.length" class="bg-surface-light border border-surface-border rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-surface-border text-gray-400 text-sm">
                <th class="text-left px-6 py-3">#</th>
                <th class="text-left px-6 py-3">隊伍名稱</th>
                <th class="text-left px-6 py-3">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(team, i) in filteredTeams"
                :key="team.teamName"
                class="border-b border-surface-border/50 hover:bg-surface-lighter/50 transition-colors"
              >
                <td class="px-6 py-4 text-gray-500 text-sm">{{ i + 1 }}</td>
                <td class="px-6 py-4 text-white font-medium">{{ team.teamName }}</td>
                <td class="px-6 py-4">
                  <StatusBadge :status="team.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        目前沒有符合條件的隊伍。
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PublicTeam, TeamStatus } from '~/types'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

const { data: result, pending, error } = await useFetch<{ data: PublicTeam[] }>(`/tournaments/${slug}/teams`, {
  baseURL: config.public.apiBase as string,
})

const teams = computed(() => result.value?.data || [])
const activeFilter = ref<'ALL' | TeamStatus>('ALL')

const filters = computed(() => {
  const all = teams.value.length
  const pending = teams.value.filter(t => t.status === 'PENDING').length
  const success = teams.value.filter(t => t.status === 'SUCCESS').length
  const failed = teams.value.filter(t => t.status === 'FAILED').length
  return [
    { label: '全部', value: 'ALL' as const, count: all },
    { label: '審核中', value: 'PENDING' as const, count: pending },
    { label: '已通過', value: 'SUCCESS' as const, count: success },
    { label: '未通過', value: 'FAILED' as const, count: failed },
  ]
})

const filteredTeams = computed(() => {
  if (activeFilter.value === 'ALL') return teams.value
  return teams.value.filter(t => t.status === activeFilter.value)
})

useHead({ title: `報名隊伍 - Airsoft Racing` })
</script>
