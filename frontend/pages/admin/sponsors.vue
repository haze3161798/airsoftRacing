<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <h1 class="text-2xl font-extrabold text-white">贊助商管理</h1>
      <div class="flex gap-3">
        <button
          class="bg-primary hover:bg-primary/80 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          @click="openCreateDialog"
        >
          + 新增贊助商
        </button>
        <button
          class="text-sm text-gray-400 hover:text-accent-failed transition-colors"
          @click="handleLogout"
        >
          登出
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400">載入中...</div>

    <!-- Sponsor list -->
    <div v-else-if="sponsors.length" class="space-y-3">
      <div
        v-for="(s, idx) in sponsors"
        :key="s.id"
        class="bg-surface-light border border-surface-border rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <!-- Thumbnail -->
        <img
          :src="imageUrl(s.id)"
          :alt="s.name"
          class="w-16 h-16 rounded-lg object-contain bg-white/10 shrink-0"
        />

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-white font-bold truncate">{{ s.name }}</span>
            <span
              :class="s.isActive
                ? 'bg-accent-success/20 text-accent-success'
                : 'bg-gray-600/20 text-gray-500'"
              class="px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
            >
              {{ s.isActive ? '上架中' : '已下架' }}
            </span>
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ s.linkUrl || '（無外連網址）' }}
          </div>
          <div class="text-xs text-gray-600 mt-0.5">
            排序：{{ s.sortOrder }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Move up -->
          <button
            v-if="idx > 0"
            class="text-gray-400 hover:text-white transition-colors p-1"
            title="上移"
            @click="moveUp(idx)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <!-- Move down -->
          <button
            v-if="idx < sponsors.length - 1"
            class="text-gray-400 hover:text-white transition-colors p-1"
            title="下移"
            @click="moveDown(idx)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- Toggle active -->
          <button
            :class="s.isActive
              ? 'text-accent-pending hover:text-yellow-400'
              : 'text-accent-success hover:text-green-400'"
            class="transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="toggleActive(s)"
          >
            {{ s.isActive ? '下架' : '上架' }}
          </button>
          <!-- Edit -->
          <button
            class="text-gray-400 hover:text-primary transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="openEditDialog(s)"
          >
            編輯
          </button>
          <!-- Delete -->
          <button
            class="text-gray-400 hover:text-accent-failed transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="openDeleteDialog(s)"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      目前沒有贊助商，點擊上方按鈕新增。
    </div>

    <!-- Create / Edit Dialog -->
    <Teleport to="body">
      <div v-if="formDialog.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-surface-light border border-surface-border rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-bold text-white mb-4">
            {{ formDialog.editing ? '編輯贊助商' : '新增贊助商' }}
          </h3>

          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">贊助商名稱 *</label>
            <input
              v-model="formDialog.name"
              type="text"
              maxlength="100"
              placeholder="例如：華山國際"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <!-- Link URL -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">外連網址（選填）</label>
            <input
              v-model="formDialog.linkUrl"
              type="url"
              maxlength="500"
              placeholder="https://example.com"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <!-- Image upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">
              {{ formDialog.editing ? 'Logo 圖片（不選則保留原圖）' : 'Logo 圖片 *' }}
            </label>
            <div
              :class="[
                'relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                dragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-surface-border hover:border-primary/50'
              ]"
              @click="($refs.fileInput as HTMLInputElement)?.click()"
              @dragover.prevent="dragging = true"
              @dragenter.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="handleDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="hidden"
                @change="handleFileSelect"
              />
              <div v-if="formDialog.previewUrl" class="flex flex-col items-center gap-2">
                <img :src="formDialog.previewUrl" alt="預覽" class="max-h-24 object-contain rounded" />
                <span class="text-xs text-gray-400">點擊或拖曳更換圖片</span>
              </div>
              <div v-else class="py-4">
                <svg class="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm text-gray-400">點擊或拖曳上傳（PNG / JPG / WebP / SVG，最大 5MB）</span>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="formDialog.error" class="mb-4 text-sm text-accent-failed">
            {{ formDialog.error }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 justify-end">
            <button
              class="bg-surface-lighter hover:bg-surface-border text-gray-300 font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
              :disabled="formDialog.saving"
              @click="formDialog.show = false"
            >
              取消
            </button>
            <button
              class="bg-primary hover:bg-primary/80 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              :disabled="formDialog.saving"
              @click="submitForm"
            >
              {{ formDialog.saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div v-if="deleteDialog.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-surface-light border border-surface-border rounded-xl p-6 w-full max-w-sm">
          <h3 class="text-lg font-bold text-white mb-3">確認刪除</h3>
          <p class="text-gray-300 text-sm mb-5">
            確定要刪除「{{ deleteDialog.name }}」嗎？此操作無法復原。
          </p>
          <div class="flex gap-3 justify-end">
            <button
              class="bg-surface-lighter hover:bg-surface-border text-gray-300 font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
              @click="deleteDialog.show = false"
            >
              取消
            </button>
            <button
              class="bg-accent-failed hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              @click="confirmDelete"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Sponsor } from '~/types'

definePageMeta({ layout: 'admin' })

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const router = useRouter()
const adminToken = useCookie('admin_token', {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
})

if (!adminToken.value) {
  router.replace('/admin')
}

// ─── State ───
const sponsors = ref<Sponsor[]>([])
const loading = ref(true)
const dragging = ref(false)

const formDialog = reactive({
  show: false,
  editing: false,
  editId: '',
  name: '',
  linkUrl: '',
  file: null as File | null,
  previewUrl: '',
  error: '',
  saving: false,
})

const deleteDialog = reactive({
  show: false,
  id: '',
  name: '',
})

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${adminToken.value}` }
}

function imageUrl(id: string) {
  return `${apiBase}/sponsors/${id}/image`
}

// ─── Load ───
async function loadSponsors() {
  loading.value = true
  try {
    sponsors.value = await $fetch<Sponsor[]>('/admin/sponsors', {
      baseURL: apiBase,
      headers: authHeaders(),
    })
  } catch (err: any) {
    if (err?.status === 401) {
      adminToken.value = null
      router.replace('/admin')
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadSponsors)

// ─── Create / Edit Dialog ───
function openCreateDialog() {
  formDialog.editing = false
  formDialog.editId = ''
  formDialog.name = ''
  formDialog.linkUrl = ''
  formDialog.file = null
  formDialog.previewUrl = ''
  formDialog.error = ''
  formDialog.saving = false
  formDialog.show = true
}

function openEditDialog(s: Sponsor) {
  formDialog.editing = true
  formDialog.editId = s.id
  formDialog.name = s.name
  formDialog.linkUrl = s.linkUrl || ''
  formDialog.file = null
  formDialog.previewUrl = imageUrl(s.id)
  formDialog.error = ''
  formDialog.saving = false
  formDialog.show = true
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    setFile(input.files[0])
  }
}

function handleDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    formDialog.error = '圖片大小不可超過 5MB'
    return
  }
  formDialog.file = file
  formDialog.previewUrl = URL.createObjectURL(file)
  formDialog.error = ''
}

async function submitForm() {
  formDialog.error = ''

  if (!formDialog.name.trim()) {
    formDialog.error = '請輸入贊助商名稱'
    return
  }
  if (!formDialog.editing && !formDialog.file) {
    formDialog.error = '請上傳 Logo 圖片'
    return
  }

  formDialog.saving = true
  try {
    const fd = new FormData()
    fd.append('name', formDialog.name.trim())
    if (formDialog.linkUrl.trim()) {
      fd.append('linkUrl', formDialog.linkUrl.trim())
    } else if (formDialog.editing) {
      fd.append('clearLinkUrl', 'true')
    }
    if (formDialog.file) {
      fd.append('image', formDialog.file)
    }

    if (formDialog.editing) {
      await $fetch(`/admin/sponsors/${formDialog.editId}`, {
        baseURL: apiBase,
        method: 'PATCH',
        headers: authHeaders(),
        body: fd,
      })
    } else {
      await $fetch('/admin/sponsors', {
        baseURL: apiBase,
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
    }

    formDialog.show = false
    await loadSponsors()
  } catch (err: any) {
    formDialog.error = err?.data?.message || '儲存失敗'
  } finally {
    formDialog.saving = false
  }
}

// ─── Toggle Active ───
async function toggleActive(s: Sponsor) {
  try {
    const fd = new FormData()
    fd.append('isActive', String(!s.isActive))
    await $fetch(`/admin/sponsors/${s.id}`, {
      baseURL: apiBase,
      method: 'PATCH',
      headers: authHeaders(),
      body: fd,
    })
    s.isActive = !s.isActive
  } catch (err: any) {
    alert(err?.data?.message || '操作失敗')
  }
}

// ─── Sort ───
async function swapSort(idxA: number, idxB: number) {
  const a = sponsors.value[idxA]
  const b = sponsors.value[idxB]
  const sortA = a.sortOrder
  const sortB = b.sortOrder

  try {
    await Promise.all([
      $fetch(`/admin/sponsors/${a.id}`, {
        baseURL: apiBase,
        method: 'PATCH',
        headers: authHeaders(),
        body: (() => { const fd = new FormData(); fd.append('sortOrder', String(sortB)); return fd })(),
      }),
      $fetch(`/admin/sponsors/${b.id}`, {
        baseURL: apiBase,
        method: 'PATCH',
        headers: authHeaders(),
        body: (() => { const fd = new FormData(); fd.append('sortOrder', String(sortA)); return fd })(),
      }),
    ])
    // Swap in UI
    a.sortOrder = sortB
    b.sortOrder = sortA
    sponsors.value.sort((x, y) => x.sortOrder - y.sortOrder)
  } catch {
    alert('排序失敗')
  }
}

function moveUp(idx: number) {
  swapSort(idx, idx - 1)
}

function moveDown(idx: number) {
  swapSort(idx, idx + 1)
}

// ─── Delete ───
function openDeleteDialog(s: Sponsor) {
  deleteDialog.id = s.id
  deleteDialog.name = s.name
  deleteDialog.show = true
}

async function confirmDelete() {
  try {
    await $fetch(`/admin/sponsors/${deleteDialog.id}`, {
      baseURL: apiBase,
      method: 'DELETE',
      headers: authHeaders(),
    })
    deleteDialog.show = false
    await loadSponsors()
  } catch (err: any) {
    alert(err?.data?.message || '刪除失敗')
  }
}

// ─── Logout ───
function handleLogout() {
  adminToken.value = null
  router.push('/admin')
}

useHead({
  title: '贊助商管理 - Airsoft Racing',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
