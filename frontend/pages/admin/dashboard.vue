<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <h1 class="text-2xl font-extrabold text-white">管理後台</h1>
      <button
        class="text-sm text-gray-400 hover:text-accent-failed transition-colors"
        @click="handleLogout"
      >
        登出
      </button>
    </div>

    <!-- Tournament Selector -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-300 mb-2">選擇賽事</label>
      <select
        v-model="selectedSlug"
        class="bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full sm:w-auto min-w-[250px]"
      >
        <option value="" disabled>請選擇賽事</option>
        <option v-for="t in tournaments" :key="t.slug" :value="t.slug">
          {{ t.name }}
        </option>
      </select>
    </div>

    <template v-if="selectedSlug">
      <!-- Status filter -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
            statusFilter === f.value
              ? 'bg-primary text-white'
              : 'bg-surface-light text-gray-400 hover:bg-surface-lighter border border-surface-border'
          ]"
          @click="statusFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingTeams" class="text-center py-12 text-gray-400">載入中...</div>

      <!-- Teams list -->
      <div v-else-if="teams.length" class="space-y-4">
        <div
          v-for="team in teams"
          :key="team.id"
          class="bg-surface-light border border-surface-border rounded-xl overflow-hidden"
        >
          <!-- Team header -->
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-surface-lighter/50 transition-colors"
            @click="toggleExpand(team.id)"
          >
            <div class="flex items-center gap-3">
              <svg
                :class="['w-4 h-4 text-gray-400 transition-transform', expanded.has(team.id) && 'rotate-90']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-white font-bold">{{ team.teamName }}</span>
              <StatusBadge :status="team.status" />
            </div>
            <div class="text-xs text-gray-500 sm:text-right">
              報名時間：{{ formatDate(team.submittedAt) }}
            </div>
          </div>

          <!-- Expanded detail -->
          <div v-if="expanded.has(team.id)" class="border-t border-surface-border px-6 py-4">
            <!-- Payment note -->
            <div v-if="team.paymentNote" class="mb-4 text-sm">
              <span class="text-gray-400">繳費備註：</span>
              <span class="text-white">{{ team.paymentNote }}</span>
            </div>

            <!-- Rejection reason -->
            <div v-if="team.rejectionReason" class="mb-4 text-sm">
              <span class="text-gray-400">退回原因：</span>
              <span class="text-accent-failed">{{ team.rejectionReason }}</span>
            </div>

            <!-- Players table -->
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-gray-400 border-b border-surface-border">
                    <th class="text-left py-2 pr-4">角色</th>
                    <th class="text-left py-2 pr-4">姓名</th>
                    <th class="text-left py-2 pr-4">手機</th>
                    <th class="text-left py-2 pr-4">身分證字號</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in team.players" :key="p.id" class="border-b border-surface-border/50">
                    <td class="py-2 pr-4">
                      <span :class="roleColor(p.role)" class="text-xs font-bold">{{ roleLabel(p.role) }}</span>
                    </td>
                    <td class="py-2 pr-4 text-white">{{ p.name }}</td>
                    <td class="py-2 pr-4 text-gray-300">{{ p.phone }}</td>
                    <td class="py-2 pr-4 text-gray-300">{{ p.nationalId || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Review actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                v-if="team.status !== 'SUCCESS'"
                class="bg-accent-success hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                :disabled="reviewing === team.id"
                @click="reviewTeam(team.id, 'SUCCESS')"
              >
                報名成功
              </button>
              <button
                v-if="team.status !== 'FAILED'"
                class="bg-surface-lighter hover:bg-surface-border text-accent-failed font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
                :disabled="reviewing === team.id"
                @click="openRejectDialog(team.id)"
              >
                退回報名
              </button>
              <button
                v-if="team.status !== 'PENDING'"
                class="bg-surface-lighter hover:bg-surface-border text-accent-pending font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
                :disabled="reviewing === team.id"
                @click="reviewTeam(team.id, 'PENDING')"
              >
                重設為審核中

              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        目前沒有報名隊伍。
      </div>
    </template>

    <!-- Reject Dialog -->
    <Teleport to="body">
      <div v-if="rejectDialog.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-surface-light border border-surface-border rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-bold text-white mb-4">退回報名</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">退回原因</label>
            <textarea
              v-model="rejectDialog.reason"
              rows="3"
              placeholder="請輸入退回原因（選填）"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>
          <div class="flex gap-3 justify-end">
            <button
              class="bg-surface-lighter hover:bg-surface-border text-gray-300 font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
              @click="rejectDialog.show = false"
            >
              取消
            </button>
            <button
              class="bg-accent-failed hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              @click="confirmReject"
            >
              確認退回
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Tournament, AdminTeam, TeamStatus } from '~/types'
const { decryptText } = useDecrypt()

definePageMeta({ layout: 'admin' })

const config = useRuntimeConfig()
const router = useRouter()
const adminToken = useCookie('admin_token', {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
})

// Auth check
if (!adminToken.value) {
  router.replace('/admin')
}

// State
const tournaments = ref<Tournament[]>([])
const selectedSlug = ref('')
const statusFilter = ref<'ALL' | TeamStatus>('ALL')
const teams = ref<AdminTeam[]>([])
const loadingTeams = ref(false)
const expanded = reactive(new Set<string>())
const reviewing = ref<string | null>(null)

const rejectDialog = reactive({
  show: false,
  teamId: '',
  reason: '',
})

const filterOptions = [
  { label: '全部', value: 'ALL' as const },
  { label: '審核中', value: 'PENDING' as const },
  { label: '報名成功', value: 'SUCCESS' as const },
  { label: '報名失敗', value: 'FAILED' as const },
]

function authHeaders() {
  return { Authorization: `Bearer ${adminToken.value}` }
}

// Load tournaments
onMounted(async () => {
  try {
    const data = await $fetch<Tournament[]>('/tournaments', {
      baseURL: config.public.apiBase as string,
    })
    tournaments.value = data
    if (data.length) {
      selectedSlug.value = data[0].slug
    }
  } catch {
    // If unauthorized
    router.replace('/admin')
  }
})

// Watch for slug/filter changes
watch([selectedSlug, statusFilter], async () => {
  if (!selectedSlug.value) return
  loadingTeams.value = true
  try {
    const query = statusFilter.value !== 'ALL' ? `?status=${statusFilter.value}` : ''
    const raw = await $fetch<AdminTeam[]>(
      `/admin/tournaments/${selectedSlug.value}/teams${query}`,
      {
        baseURL: config.public.apiBase as string,
        headers: authHeaders(),
      },
    )
    // Decrypt phone + national IDs using transport key
    const tk = sessionStorage.getItem('admin_tk')
    if (tk) {
      for (const team of raw) {
        for (const p of team.players) {
          if (p.phone) {
            p.phone = await decryptText(p.phone, tk)
          }
          if (p.nationalId) {
            p.nationalId = await decryptText(p.nationalId, tk)
          }
        }
      }
    }
    teams.value = raw
  } catch (err: any) {
    if (err?.status === 401) {
      adminToken.value = null
      router.replace('/admin')
    }
    teams.value = []
  } finally {
    loadingTeams.value = false
  }
}, { immediate: true })

function toggleExpand(id: string) {
  if (expanded.has(id)) expanded.delete(id)
  else expanded.add(id)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function roleLabel(role: string) {
  return { CAPTAIN: '隊長', STARTER: '先發', SUBSTITUTE: '替補' }[role] || role
}

function roleColor(role: string) {
  return {
    CAPTAIN: 'text-primary',
    STARTER: 'text-accent-success',
    SUBSTITUTE: 'text-accent-pending',
  }[role] || 'text-gray-400'
}

async function reviewTeam(teamId: string, status: string, rejectionReason?: string) {
  reviewing.value = teamId
  try {
    await $fetch(`/admin/teams/${teamId}/review`, {
      baseURL: config.public.apiBase as string,
      method: 'PATCH',
      headers: authHeaders(),
      body: { status, rejectionReason },
    })
    // Refresh list
    const idx = teams.value.findIndex(t => t.id === teamId)
    if (idx !== -1) {
      teams.value[idx].status = status as TeamStatus
      teams.value[idx].rejectionReason = rejectionReason || null
      teams.value[idx].reviewedAt = new Date().toISOString()
    }
  } catch (err: any) {
    alert(err?.data?.message || '操作失敗')
  } finally {
    reviewing.value = null
  }
}

function openRejectDialog(teamId: string) {
  rejectDialog.teamId = teamId
  rejectDialog.reason = ''
  rejectDialog.show = true
}

async function confirmReject() {
  rejectDialog.show = false
  await reviewTeam(rejectDialog.teamId, 'FAILED', rejectDialog.reason || undefined)
}

function handleLogout() {
  adminToken.value = null
  router.push('/admin')
}

useHead({ title: '管理後台 - Airsoft Racing' })
</script>
