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
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 whitespace-pre-line">{{ tournament.name }}</h2>
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
        <hr class="border-surface-border my-5" />
        <div class="text-gray-300 text-sm leading-relaxed">
          <p class="mb-3">各位參賽者您好：</p>
          <p class="mb-3">
            因場地因素，本次比賽將延後至
            <strong class="text-red-400">6 月 7 日（日）</strong>
            舉辦。造成各位在行程安排上的不便，主辦單位深感抱歉。為表達我們的誠意並回饋選手的支持，本次報名費用調整如下：
          </p>
          <ul class="pl-5 space-y-2 mb-3">
            <li>
              <strong class="text-white">1. 人人有感補償：</strong><br />
              報名費直接減免 <strong class="text-red-400">1,000 元</strong>，由我們承擔這份不便。
            </li>
            <li>
              <strong class="text-white">2. 年輕選手加碼：</strong><br />
              為鼓勵新秀參賽，隊伍中成員若為 <strong class="text-red-400">18 歲（含）以下</strong>，每位選手可再折抵 <strong class="text-red-400">200 元</strong>。
            </li>
          </ul>
        </div>
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
        <button
          type="button"
          class="bg-primary hover:bg-primary-600 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
          @click="showPaymentDialog = true"
        >
          如果忘記繳費資訊請點此
        </button>
      </div>

      <!-- Payment Dialog -->
      <Teleport to="body">
        <div v-if="showPaymentDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70" @click="showPaymentDialog = false" />
          <div class="relative bg-surface-light border border-surface-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              @click="showPaymentDialog = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 class="text-lg font-bold text-white mb-4">繳費資訊</h3>
            <div class="space-y-3 text-sm text-gray-300">
              <p>每隊報名費：<span class="text-white font-semibold">4,500 元</span></p>
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
        </div>
      </Teleport>
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

const showPaymentDialog = ref(false)


const qrCodeSrc = computed(() => {
  const base = (config.public.apiBase as string).replace(/\/api$/, '')
  return `${base}/public/line-qrcode.png`
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

const backendBase = (config.public.apiBase as string).replace(/\/api$/, '')

const seoTitle = computed(() =>
  tournament.value?.name ? `${tournament.value.name} - Airsoft Racing` : 'Airsoft Racing',
)
const seoDesc = computed(() =>
  tournament.value?.description
    ? `${tournament.value.name} — ${tournament.value.description.slice(0, 120)}`
    : `${tournament.value?.name || 'Airsoft Racing'} — 氣槍競速電競賽事詳情與線上報名`,
)
const ogImage = computed(() => {
  const path = tournament.value?.bannerUrl
  return path ? (path.startsWith('/') ? `${backendBase}${path}` : path) : `${backendBase}/public/banner.png`
})

useHead({
  title: seoTitle,
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: tournament.value?.name || '',
        description: tournament.value?.description || '',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        organizer: {
          '@type': 'Organization',
          name: 'Airsoft Racing',
        },
        ...(tournament.value?.registrationCloseAt && {
          startDate: tournament.value.registrationCloseAt,
        }),
      })),
    },
  ],
})
useSeoMeta({
  ogTitle: seoTitle,
  description: seoDesc,
  ogDescription: seoDesc,
  ogImage,
  twitterTitle: seoTitle,
  twitterDescription: seoDesc,
  twitterImage: ogImage,
})
</script>
