<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <NuxtLink :to="`/tournament/${slug}`" class="text-sm text-gray-400 hover:text-primary transition-colors mb-6 inline-block">
      &larr; 返回賽事頁面
    </NuxtLink>

    <h2 class="text-2xl sm:text-3xl font-extrabold text-white mb-8">報名隊伍一覽（職業組）</h2>

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
                <th class="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(team, i) in filteredTeams" :key="team.teamName">
                <tr
                  class="border-b border-surface-border/50 hover:bg-surface-lighter/50 transition-colors cursor-pointer"
                  @click="toggleExpand(team.teamName)"
                >
                  <td class="px-6 py-4 text-gray-500 text-sm">{{ i + 1 }}</td>
                  <td class="px-6 py-4 text-white font-medium">{{ team.teamName }}</td>
                  <td class="px-6 py-4">
                    <StatusBadge :status="team.status" />
                  </td>
                  <td class="px-6 py-4 text-gray-400">
                    <svg
                      :class="['w-4 h-4 transition-transform', expandedTeam === team.teamName ? 'rotate-180' : '']"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                </tr>
                <tr v-if="expandedTeam === team.teamName">
                  <td colspan="4" class="px-6 pb-4 pt-0">
                    <div class="bg-surface rounded-lg p-4">
                      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        <div v-for="player in team.players" :key="player.name" class="flex items-center gap-2">
                          <span :class="roleColor(player.role)" class="text-xs font-bold shrink-0">{{ roleLabel(player.role) }}</span>
                          <span class="text-white">{{ maskName(player.name) }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
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

const config = useRuntimeConfig()
const slug = 'season-1'

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
    { label: '報名成功', value: 'SUCCESS' as const, count: success },
    { label: '報名失敗', value: 'FAILED' as const, count: failed },
  ]
})

const filteredTeams = computed(() => {
  if (activeFilter.value === 'ALL') return teams.value
  return teams.value.filter(t => t.status === activeFilter.value)
})

const expandedTeam = ref<string | null>(null)

function toggleExpand(teamName: string) {
  expandedTeam.value = expandedTeam.value === teamName ? null : teamName
}

function maskName(name: string) {
  const trimmed = (name || '').trim()
  if (!trimmed) return ''
  const chars = Array.from(trimmed)
  if (chars.length <= 1) return trimmed
  return chars[0] + '〇'.repeat(chars.length - 1)
}

function roleLabel(role: string) {
  return { CAPTAIN: '隊長', STARTER: '隊員', SUBSTITUTE: '候補隊員' }[role] || role
}

function roleColor(role: string) {
  return {
    CAPTAIN: 'text-primary',
    STARTER: 'text-accent-success',
    SUBSTITUTE: 'text-accent-pending',
  }[role] || 'text-gray-400'
}

const backendBase = (config.public.apiBase as string).replace(/\/api$/, '')

useHead({ title: '報名隊伍一覽（職業組） - Airsoft Racing' })
useSeoMeta({
  description: '查看職業組各隊伍報名狀態與成員名單 — Airsoft Racing 氣槍競速賽。',
  ogTitle: '報名隊伍一覽（職業組） - Airsoft Racing',
  ogDescription: '查看職業組各隊伍報名狀態與成員名單 — Airsoft Racing 氣槍競速賽。',
  ogImage: `${backendBase}/public/banner.png`,
  twitterTitle: '報名隊伍一覽（職業組） - Airsoft Racing',
  twitterDescription: '查看職業組各隊伍報名狀態與成員名單 — Airsoft Racing 氣槍競速賽。',
  twitterImage: `${backendBase}/public/banner.png`,
})
</script>
