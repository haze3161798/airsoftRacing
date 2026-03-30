<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <NuxtLink :to="`/tournament/${slug}`" class="text-sm text-gray-400 hover:text-primary transition-colors mb-6 inline-block">
      &larr; 返回賽事頁面
    </NuxtLink>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-8">隊伍報名</h1>

    <!-- Step Indicator -->
    <div class="flex items-center mb-10">
      <template v-for="(stepLabel, i) in steps" :key="i">
        <div class="flex items-center">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              currentStep > i ? 'bg-accent-success text-white' :
              currentStep === i ? 'bg-primary text-white' :
              'bg-surface-lighter text-gray-500'
            ]"
          >
            <svg v-if="currentStep > i" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            :class="[
              'ml-2 text-sm hidden sm:inline',
              currentStep >= i ? 'text-white' : 'text-gray-500'
            ]"
          >
            {{ stepLabel }}
          </span>
        </div>
        <div
          v-if="i < steps.length - 1"
          :class="[
            'flex-1 h-0.5 mx-3',
            currentStep > i ? 'bg-accent-success' : 'bg-surface-border'
          ]"
        />
      </template>
    </div>

    <!-- Step 1: Team Info -->
    <div v-show="currentStep === 0" class="space-y-6">
      <div class="bg-surface-light border border-surface-border rounded-xl p-6">
        <h2 class="text-lg font-bold text-white mb-4">隊伍資訊</h2>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">隊伍名稱 <span class="text-accent-failed">*</span></label>
          <input
            v-model="form.teamName"
            type="text"
            maxlength="100"
            placeholder="請輸入隊伍名稱"
            class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <p v-if="errors.teamName" class="text-accent-failed text-xs mt-1">{{ errors.teamName }}</p>
        </div>
      </div>
    </div>
      <div class="text-red-600 text-sm my-3">「本次比賽為 4 v 4 賽制。請將隊長與三位正式隊員的資料，確實填寫於【隊長】與【隊員】欄位。如有候補隊員（0~2 名），請於表單最下方的專屬區塊填寫。感謝您的配合！」</div>
    <!-- Step 2: Player Info -->
    <div v-show="currentStep === 1" class="space-y-4">
      <!-- Required players: Captain + Starters -->
      <div
        v-for="(player, i) in requiredPlayers"
        :key="'req-' + i"
        class="bg-surface-light border border-surface-border rounded-xl p-6"
      >
        <h3 class="text-base font-bold text-white mb-4">
          <span :class="roleColor(player.role)">{{ roleLabel(player.role) }}</span>
          <span class="text-gray-400 font-normal text-sm ml-2">#{{ i === 0 ? 1 : i }}</span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">姓名 <span class="text-accent-failed">*</span></label>
            <input
              v-model="player.name"
              type="text"
              maxlength="100"
              placeholder="真實姓名"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">手機號碼 <span class="text-accent-failed">*</span></label>
            <input
              v-model="player.phone"
              type="tel"
              maxlength="10"
              placeholder="09xxxxxxxx"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">身分證字號 <span class="text-accent-failed">*</span></label>
            <input
              v-model="player.nationalId"
              type="text"
              maxlength="10"
              placeholder="A123456789"
              class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors uppercase"
            />
          </div>
        </div>
        <p v-if="errors.players?.[i]" class="text-accent-failed text-xs mt-2">{{ errors.players[i] }}</p>
      </div>

      <!-- Substitute section -->
      <div class="border-t border-surface-border pt-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">候補隊員選手 <span class="text-sm font-normal text-gray-400">（選填，0~2 名）</span></h3>
          <button
            v-if="substitutes.length < 2"
            type="button"
            class="text-sm text-primary hover:text-primary-400 font-semibold transition-colors"
            @click="addSubstitute"
          >
            + 新增候補隊員
          </button>
        </div>

        <div v-if="!substitutes.length" class="text-center py-6 text-gray-500 text-sm bg-surface-light border border-dashed border-surface-border rounded-xl">
          尚未新增候補隊員選手（可跳過）
        </div>

        <div
          v-for="(sub, si) in substitutes"
          :key="'sub-' + si"
          class="bg-surface-light border border-surface-border rounded-xl p-6 mb-4"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-white">
              <span class="text-accent-pending">候補隊員</span>
              <span class="text-gray-400 font-normal text-sm ml-2">#{{ si + 1 }}</span>
            </h3>
            <button
              type="button"
              class="text-sm text-accent-failed hover:text-red-400 transition-colors"
              @click="removeSubstitute(si)"
            >
              移除
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">姓名 <span class="text-accent-failed">*</span></label>
              <input
                v-model="sub.name"
                type="text"
                maxlength="100"
                placeholder="真實姓名"
                class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">手機號碼 <span class="text-accent-failed">*</span></label>
              <input
                v-model="sub.phone"
                type="tel"
                maxlength="10"
                placeholder="09xxxxxxxx"
                class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-1">身分證字號 <span class="text-accent-failed">*</span></label>
              <input
                v-model="sub.nationalId"
                type="text"
                maxlength="10"
                placeholder="A123456789"
                class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors uppercase"
              />
            </div>
          </div>
          <p v-if="errors.players?.[4 + si]" class="text-accent-failed text-xs mt-2">{{ errors.players[4 + si] }}</p>
        </div>
      </div>
    </div>

    <!-- Step 3: Payment + Confirm -->
    <div v-show="currentStep === 2" class="space-y-6">

      <!-- Payment Info -->
      <div class="bg-surface-light border border-surface-border rounded-xl p-6">
        <h2 class="text-lg font-bold text-white mb-4">繳費資訊</h2>
        <div class="space-y-3 text-sm text-gray-300">
          <p>每隊報名費：<span class="text-white font-semibold">5,500 元</span></p>
          <p>收款人：<span class="text-white font-semibold">吳文元</span></p>
          <p>匯款資料：<span class="text-white font-semibold">（700）00410771562859</span></p>
          <p class="text-accent-pending">付款後請向收款人進行資料核對，核對完成後就完美報名成功了！</p>
          <p>收款人聯絡方式：<span class="text-white font-semibold">電話 0906808397</span>（可用電話加 Line）</p>
          <p>隊長集合群組：<a href="https://line.me/ti/g/yL3sg8S8ky" target="_blank" rel="noopener" class="text-primary hover:text-primary-400 underline transition-colors">點此加入</a></p>
        </div>
        <div class="mt-4 flex justify-center">
          <img :src="qrCodeSrc" alt="LINE QR Code" class="w-48 h-48 rounded-lg" />
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-surface-light border border-surface-border rounded-xl p-6">
        <h2 class="text-lg font-bold text-white mb-4">報名資料確認</h2>
        <div class="mb-4">
          <span class="text-gray-400 text-sm">隊伍名稱：</span>
          <span class="text-white font-bold">{{ form.teamName }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-400 border-b border-surface-border">
                <th class="text-left py-2 pr-4">角色</th>
                <th class="text-left py-2 pr-4">姓名</th>
                <th class="text-left py-2 pr-4">手機</th>
                <th class="text-left py-2">身分證</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in allPlayers" :key="i" class="border-b border-surface-border/50">
                <td class="py-2 pr-4">
                  <span :class="roleColor(p.role)" class="text-xs font-bold">{{ roleLabel(p.role) }}</span>
                </td>
                <td class="py-2 pr-4 text-white">{{ p.name }}</td>
                <td class="py-2 pr-4 text-gray-300">{{ p.phone }}</td>
                <td class="py-2 text-gray-300">{{ maskId(p.nationalId) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Success -->
    <div v-if="currentStep === 3" class="text-center py-12">
      <div class="w-16 h-16 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">報名成功！</h2>
      <p class="text-gray-400 mb-6">您的隊伍已送出報名，請留意後續通知。</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          :to="`/tournament/${slug}/teams`"
          class="inline-flex items-center justify-center bg-primary hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          查看報名狀態
        </NuxtLink>
        <NuxtLink
          :to="`/tournament/${slug}`"
          class="inline-flex items-center justify-center bg-surface-lighter hover:bg-surface-border text-white font-semibold px-6 py-3 rounded-lg border border-surface-border transition-colors"
        >
          返回賽事頁面
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div v-if="currentStep < 3" class="flex justify-between mt-8">
      <button
        v-if="currentStep > 0"
        class="bg-surface-lighter hover:bg-surface-border text-white font-semibold px-6 py-2.5 rounded-lg border border-surface-border transition-colors"
        @click="currentStep--"
      >
        上一步
      </button>
      <div v-else />

      <button
        v-if="currentStep < 2"
        class="bg-primary hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
        @click="nextStep"
      >
        下一步
      </button>
      <button
        v-else
        :disabled="submitting"
        class="bg-accent-success hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        @click="submitForm"
      >
        <svg v-if="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        確認送出報名
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="submitError" class="mt-4 bg-accent-failed/10 border border-accent-failed/30 rounded-lg p-4 text-accent-failed text-sm">
      {{ submitError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterPlayerInput } from '~/types'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

const steps = ['隊伍資訊', '選手資料', '確認送出']
const currentStep = ref(0)
const submitting = ref(false)

const qrCodeSrc = computed(() => {
  const base = (config.public.apiBase as string).replace(/\/api$/, '')
  return `${base}/public/line-qrcode.png`
})
const submitError = ref('')
// Required players: 1 CAPTAIN + 3 STARTER (fixed)
function createRequiredPlayers(): RegisterPlayerInput[] {
  return [
    { name: '', phone: '', nationalId: '', role: 'CAPTAIN' },
    ...Array.from({ length: 3 }, () => ({ name: '', phone: '', nationalId: '', role: 'STARTER' as const })),
  ]
}

const form = reactive({
  teamName: '',
  paymentNote: '',
  requiredPlayers: createRequiredPlayers(),
  substitutes: [] as RegisterPlayerInput[],
})

// Computed references for template
const requiredPlayers = computed(() => form.requiredPlayers)
const substitutes = computed(() => form.substitutes)
const allPlayers = computed(() => [...form.requiredPlayers, ...form.substitutes])

function addSubstitute() {
  if (form.substitutes.length < 2) {
    form.substitutes.push({ name: '', phone: '', nationalId: '', role: 'SUBSTITUTE' })
  }
}

function removeSubstitute(index: number) {
  form.substitutes.splice(index, 1)
}

const errors = reactive<{ teamName?: string; players?: Record<number, string> }>({})

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

function maskId(id: string) {
  if (!id || id.length <= 6) return id
  return id.substring(0, 3) + '*'.repeat(id.length - 6) + id.substring(id.length - 3)
}

function validateStep0(): boolean {
  errors.teamName = undefined
  if (!form.teamName.trim()) {
    errors.teamName = '請輸入隊伍名稱'
    return false
  }
  return true
}

function validateStep1(): boolean {
  errors.players = {}
  let valid = true
  const phoneRegex = /^09\d{8}$/
  // 身分證只驗必填+長度10碼

  const all = allPlayers.value

  // Validate required players (index 0~5): all fields mandatory
  all.forEach((p, i) => {
    const msgs: string[] = []
    if (!p.name.trim()) msgs.push('姓名不可為空')
    if (!phoneRegex.test(p.phone)) msgs.push('手機號碼格式錯誤（09開頭共10碼）')
    if (!p.nationalId.trim()) msgs.push('身分證字號不可為空')
    else if (p.nationalId.trim().length !== 10) msgs.push('身分證字號長度須為 10 碼')
    if (msgs.length) {
      errors.players![i] = msgs.join('、')
      valid = false
    }
  })


  return valid
}

function nextStep() {
  if (currentStep.value === 0 && !validateStep0()) return
  if (currentStep.value === 1 && !validateStep1()) return
  currentStep.value++
}

async function submitForm() {
  submitError.value = ''
  submitting.value = true
  try {
    // Uppercase national IDs before sending
    const payload = {
      teamName: form.teamName.trim(),
      paymentNote: form.paymentNote.trim() || undefined,
      players: allPlayers.value.map(p => ({
        ...p,
        name: p.name.trim(),
        nationalId: p.nationalId.toUpperCase(),
      })),
    }

    await $fetch(`/tournaments/${slug}/register`, {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: payload,
    })

    currentStep.value = 3
  } catch (err: any) {
    const message = err?.data?.message || err?.message || '報名失敗，請稍後再試。'
    submitError.value = Array.isArray(message) ? message.join('、') : message
  } finally {
    submitting.value = false
  }
}

useHead({ title: `報名 - Airsoft Racing` })
</script>
