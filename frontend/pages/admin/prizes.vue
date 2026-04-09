<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <h1 class="text-2xl font-extrabold text-white">獎品管理</h1>
      <div class="flex gap-3">
        <button
          class="bg-surface-lighter hover:bg-surface-border text-gray-300 font-semibold px-4 py-2 rounded-lg text-sm border border-surface-border transition-colors"
          @click="showTagManager = true"
        >
          標籤管理
        </button>
        <button
          class="bg-primary hover:bg-primary/80 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          @click="openCreateDialog"
        >
          + 新增獎品
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

    <!-- Prize list -->
    <div v-else-if="prizes.length" class="space-y-3">
      <div
        v-for="(p, idx) in prizes"
        :key="p.id"
        class="bg-surface-light border border-surface-border rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <!-- Thumbnail -->
        <img
          :src="prizeImageUrl(p.id)"
          :alt="p.name"
          class="w-16 h-16 rounded-lg object-contain bg-white/10 shrink-0"
        />

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-white font-bold truncate">{{ p.name }}</span>
            <span
              v-if="p.prizeTag"
              class="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
            >
              {{ p.prizeTag.name }}
            </span>
            <span
              :class="p.isActive
                ? 'bg-accent-success/20 text-accent-success'
                : 'bg-gray-600/20 text-gray-500'"
              class="px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
            >
              {{ p.isActive ? '上架中' : '已下架' }}
            </span>
            <!-- 精選標籤暫時隱藏 -->

          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ p.sponsor ? `贊助：${p.sponsor.name}` : '（無贊助商）' }}
          </div>
          <div v-if="p.description" class="text-xs text-gray-600 mt-0.5 truncate">
            {{ p.description }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
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
          <button
            v-if="idx < prizes.length - 1"
            class="text-gray-400 hover:text-white transition-colors p-1"
            title="下移"
            @click="moveDown(idx)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- 設為精選按鈕暫時隱藏 -->
          <button
            :class="p.isActive
              ? 'text-accent-pending hover:text-yellow-400'
              : 'text-accent-success hover:text-green-400'"
            class="transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="toggleActive(p)"
          >
            {{ p.isActive ? '下架' : '上架' }}
          </button>
          <button
            class="text-gray-400 hover:text-primary transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="openEditDialog(p)"
          >
            編輯
          </button>
          <button
            class="text-gray-400 hover:text-accent-failed transition-colors text-xs font-semibold px-2 py-1 rounded border border-surface-border"
            @click="openDeleteDialog(p)"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      目前沒有獎品，點擊上方按鈕新增。
    </div>

    <!-- ═══ Create / Edit Prize Dialog ═══ -->
    <Teleport to="body">
      <div v-if="formDialog.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-surface-light border border-surface-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-white mb-4">
            {{ formDialog.editing ? '編輯獎品' : '新增獎品' }}
          </h3>

          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">獎品名稱 *</label>
            <input
              v-model="formDialog.name"
              type="text"
              maxlength="200"
              placeholder="例如：Lancer Tactical 衝鋒槍"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">獎品說明（選填）</label>
            <textarea
              v-model="formDialog.description"
              maxlength="1000"
              rows="3"
              placeholder="商品描述..."
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          <!-- Sponsor select -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">贊助商（選填）</label>
            <select
              v-model="formDialog.sponsorId"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">不指定</option>
              <option v-for="s in sponsors" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <!-- Tag select -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">標籤（選填）</label>
            <select
              v-model="formDialog.prizeTagId"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">不指定</option>
              <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <!-- Image upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">
              {{ formDialog.editing ? '商品圖片（不選則保留原圖）' : '商品圖片 *' }}
            </label>
            <div
              :class="[
                'relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                dragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-surface-border hover:border-primary/50'
              ]"
              @click="() => { if (fileInput) { fileInput.value = ''; fileInput.click() } }"
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

          <!-- Error -->
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

    <!-- ═══ Delete Confirm Dialog ═══ -->
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

    <!-- ═══ Tag Manager Dialog ═══ -->
    <Teleport to="body">
      <div v-if="showTagManager" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div class="bg-surface-light border border-surface-border rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">標籤管理</h3>
            <button class="text-gray-400 hover:text-white" @click="showTagManager = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Add new tag -->
          <div class="flex gap-2 mb-4">
            <input
              v-model="newTagName"
              type="text"
              maxlength="100"
              placeholder="新增標籤名稱..."
              class="flex-1 bg-surface border border-surface-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              @keyup.enter="addTag"
            />
            <button
              class="bg-primary hover:bg-primary/80 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shrink-0"
              @click="addTag"
            >
              新增
            </button>
          </div>

          <!-- Tag list -->
          <div v-if="tags.length" class="space-y-2">
            <div
              v-for="(t, idx) in tags"
              :key="t.id"
              class="flex items-center gap-2 bg-surface border border-surface-border rounded-lg px-3 py-2"
            >
              <input
                v-if="editingTagId === t.id"
                v-model="editingTagName"
                type="text"
                maxlength="100"
                class="flex-1 bg-transparent text-white text-sm focus:outline-none"
                @keyup.enter="saveTag(t.id)"
                @keyup.escape="editingTagId = ''"
              />
              <span v-else class="flex-1 text-white text-sm">{{ t.name }}</span>

              <span v-if="t._count" class="text-xs text-gray-500 shrink-0">
                {{ t._count.prizes }} 件
              </span>

              <!-- Sort buttons -->
              <button
                v-if="idx > 0"
                class="text-gray-500 hover:text-white p-0.5"
                @click="moveTagUp(idx)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                v-if="idx < tags.length - 1"
                class="text-gray-500 hover:text-white p-0.5"
                @click="moveTagDown(idx)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <template v-if="editingTagId === t.id">
                <button class="text-accent-success hover:text-green-400 text-xs font-semibold" @click="saveTag(t.id)">儲存</button>
                <button class="text-gray-400 hover:text-white text-xs" @click="editingTagId = ''">取消</button>
              </template>
              <template v-else>
                <button class="text-gray-400 hover:text-primary text-xs" @click="startEditTag(t)">編輯</button>
                <button class="text-gray-400 hover:text-accent-failed text-xs" @click="deleteTag(t)">刪除</button>
              </template>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-500 text-sm">
            尚無標籤，在上方輸入後新增。
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Prize, PrizeTag, Sponsor } from '~/types'

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
const prizes = ref<Prize[]>([])
const tags = ref<PrizeTag[]>([])
const sponsors = ref<Sponsor[]>([])
const loading = ref(true)
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const formDialog = reactive({
  show: false,
  editing: false,
  editId: '',
  name: '',
  description: '',
  sponsorId: '',
  prizeTagId: '',
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

// Tag manager
const showTagManager = ref(false)
const newTagName = ref('')
const editingTagId = ref('')
const editingTagName = ref('')

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${adminToken.value}` }
}

const imageCacheBuster = ref(Date.now())

function prizeImageUrl(id: string) {
  return `${apiBase}/prizes/${id}/image?t=${imageCacheBuster.value}`
}

// ─── Load Data ───
async function loadAll() {
  loading.value = true
  try {
    const [prizesRes, tagsRes, sponsorsRes] = await Promise.all([
      $fetch<Prize[]>('/admin/prizes', { baseURL: apiBase, headers: authHeaders() }),
      $fetch<PrizeTag[]>('/admin/prize-tags', { baseURL: apiBase, headers: authHeaders() }),
      $fetch<Sponsor[]>('/admin/sponsors', { baseURL: apiBase, headers: authHeaders() }),
    ])
    prizes.value = prizesRes
    tags.value = tagsRes
    sponsors.value = sponsorsRes
  } catch (err: any) {
    if (err?.status === 401) {
      adminToken.value = null
      router.replace('/admin')
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

// ─── Prize CRUD ───
function openCreateDialog() {
  formDialog.editing = false
  formDialog.editId = ''
  formDialog.name = ''
  formDialog.description = ''
  formDialog.sponsorId = ''
  formDialog.prizeTagId = ''
  formDialog.file = null
  formDialog.previewUrl = ''
  formDialog.error = ''
  formDialog.saving = false
  formDialog.show = true
}

function openEditDialog(p: Prize) {
  formDialog.editing = true
  formDialog.editId = p.id
  formDialog.name = p.name
  formDialog.description = p.description || ''
  formDialog.sponsorId = p.sponsor?.id || ''
  formDialog.prizeTagId = p.prizeTag?.id || ''
  formDialog.file = null
  formDialog.previewUrl = prizeImageUrl(p.id)
  formDialog.error = ''
  formDialog.saving = false
  formDialog.show = true
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
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
    formDialog.error = '請輸入獎品名稱'
    return
  }
  if (!formDialog.editing && !formDialog.file) {
    formDialog.error = '請上傳商品圖片'
    return
  }

  formDialog.saving = true
  try {
    const fd = new FormData()
    fd.append('name', formDialog.name.trim())
    if (formDialog.description.trim()) {
      fd.append('description', formDialog.description.trim())
    }
    if (formDialog.sponsorId) {
      fd.append('sponsorId', formDialog.sponsorId)
    } else if (formDialog.editing) {
      fd.append('clearSponsor', 'true')
    }
    if (formDialog.prizeTagId) {
      fd.append('prizeTagId', formDialog.prizeTagId)
    } else if (formDialog.editing) {
      fd.append('clearPrizeTag', 'true')
    }
    if (formDialog.file) {
      fd.append('image', formDialog.file)
    }

    if (formDialog.editing) {
      await $fetch(`/admin/prizes/${formDialog.editId}`, {
        baseURL: apiBase, method: 'PATCH', headers: authHeaders(), body: fd,
      })
    } else {
      await $fetch('/admin/prizes', {
        baseURL: apiBase, method: 'POST', headers: authHeaders(), body: fd,
      })
    }

    formDialog.show = false
    imageCacheBuster.value = Date.now()
    await loadAll()
  } catch (err: any) {
    formDialog.error = err?.data?.message || '儲存失敗'
  } finally {
    formDialog.saving = false
  }
}

// ─── Toggle ───
async function toggleActive(p: Prize) {
  try {
    const fd = new FormData()
    fd.append('isActive', String(!p.isActive))
    await $fetch(`/admin/prizes/${p.id}`, {
      baseURL: apiBase, method: 'PATCH', headers: authHeaders(), body: fd,
    })
    p.isActive = !p.isActive
  } catch (err: any) {
    alert(err?.data?.message || '操作失敗')
  }
}

async function toggleFeatured(p: Prize) {
  try {
    const fd = new FormData()
    fd.append('isFeatured', String(!p.isFeatured))
    await $fetch(`/admin/prizes/${p.id}`, {
      baseURL: apiBase, method: 'PATCH', headers: authHeaders(), body: fd,
    })
    p.isFeatured = !p.isFeatured
  } catch (err: any) {
    alert(err?.data?.message || '操作失敗')
  }
}

// ─── Sort ───
async function swapSort(idxA: number, idxB: number) {
  const a = prizes.value[idxA]
  const b = prizes.value[idxB]
  const sortA = a.sortOrder
  const sortB = b.sortOrder
  try {
    await Promise.all([
      $fetch(`/admin/prizes/${a.id}`, {
        baseURL: apiBase, method: 'PATCH', headers: authHeaders(),
        body: (() => { const fd = new FormData(); fd.append('sortOrder', String(sortB)); return fd })(),
      }),
      $fetch(`/admin/prizes/${b.id}`, {
        baseURL: apiBase, method: 'PATCH', headers: authHeaders(),
        body: (() => { const fd = new FormData(); fd.append('sortOrder', String(sortA)); return fd })(),
      }),
    ])
    a.sortOrder = sortB
    b.sortOrder = sortA
    prizes.value.sort((x, y) => x.sortOrder - y.sortOrder)
  } catch {
    alert('排序失敗')
  }
}

function moveUp(idx: number) { swapSort(idx, idx - 1) }
function moveDown(idx: number) { swapSort(idx, idx + 1) }

// ─── Delete ───
function openDeleteDialog(p: Prize) {
  deleteDialog.id = p.id
  deleteDialog.name = p.name
  deleteDialog.show = true
}

async function confirmDelete() {
  try {
    await $fetch(`/admin/prizes/${deleteDialog.id}`, {
      baseURL: apiBase, method: 'DELETE', headers: authHeaders(),
    })
    deleteDialog.show = false
    await loadAll()
  } catch (err: any) {
    alert(err?.data?.message || '刪除失敗')
  }
}

// ─── Tag CRUD ───
async function loadTags() {
  try {
    tags.value = await $fetch<PrizeTag[]>('/admin/prize-tags', {
      baseURL: apiBase, headers: authHeaders(),
    })
  } catch {}
}

async function addTag() {
  const name = newTagName.value.trim()
  if (!name) return
  try {
    await $fetch('/admin/prize-tags', {
      baseURL: apiBase, method: 'POST', headers: authHeaders(),
      body: { name },
    })
    newTagName.value = ''
    await loadTags()
  } catch (err: any) {
    alert(err?.data?.message || '新增失敗')
  }
}

function startEditTag(t: PrizeTag) {
  editingTagId.value = t.id
  editingTagName.value = t.name
}

async function saveTag(id: string) {
  const name = editingTagName.value.trim()
  if (!name) return
  try {
    await $fetch(`/admin/prize-tags/${id}`, {
      baseURL: apiBase, method: 'PATCH', headers: authHeaders(),
      body: { name },
    })
    editingTagId.value = ''
    await loadTags()
  } catch (err: any) {
    alert(err?.data?.message || '更新失敗')
  }
}

async function deleteTag(t: PrizeTag) {
  if (!confirm(`確定要刪除標籤「${t.name}」嗎？已關聯的獎品將解除標籤。`)) return
  try {
    await $fetch(`/admin/prize-tags/${t.id}`, {
      baseURL: apiBase, method: 'DELETE', headers: authHeaders(),
    })
    await loadTags()
  } catch (err: any) {
    alert(err?.data?.message || '刪除失敗')
  }
}

async function swapTagSort(idxA: number, idxB: number) {
  const a = tags.value[idxA]
  const b = tags.value[idxB]
  const sortA = a.sortOrder
  const sortB = b.sortOrder
  try {
    await Promise.all([
      $fetch(`/admin/prize-tags/${a.id}`, {
        baseURL: apiBase, method: 'PATCH', headers: authHeaders(),
        body: { sortOrder: sortB },
      }),
      $fetch(`/admin/prize-tags/${b.id}`, {
        baseURL: apiBase, method: 'PATCH', headers: authHeaders(),
        body: { sortOrder: sortA },
      }),
    ])
    a.sortOrder = sortB
    b.sortOrder = sortA
    tags.value.sort((x, y) => x.sortOrder - y.sortOrder)
  } catch {
    alert('排序失敗')
  }
}

function moveTagUp(idx: number) { swapTagSort(idx, idx - 1) }
function moveTagDown(idx: number) { swapTagSort(idx, idx + 1) }

// ─── Logout ───
function handleLogout() {
  adminToken.value = null
  router.push('/admin')
}

useHead({
  title: '獎品管理 - Airsoft Racing',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
