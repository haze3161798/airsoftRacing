<template>
  <div>
    <!-- Hero Banner -->
    <section v-if="bannerSrc" class="relative w-full overflow-hidden bg-surface-light" style="aspect-ratio: 2.45 / 1;">
      <img
        :src="bannerSrc"
        alt="極限速度杯 Airsoft Contest — 氣槍競速電競賽事宣傳圖"
        class="absolute inset-0 w-full h-full object-cover"
      />
     
    </section>

    <!-- Prize Page Button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
      <NuxtLink
        to="/prizes"
        class="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
      >
        🏆 獎品一覽
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <!-- Announcement Banner -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
      <div class="relative border-2 border-orange-500 rounded-xl p-6 bg-orange-500/10 backdrop-blur">
        <h3 class="text-center text-xl font-bold text-orange-400 mb-4">
          ⚠️ 重要公告 ⚠️
        </h3>
        <p class="text-gray-200 leading-relaxed mb-3">
          各位參賽者您好：
        </p>
        <p class="text-gray-200 leading-relaxed mb-3">
          因場地因素，本次比賽將延後至
          <strong class="text-red-400">6 月 7 日（日）</strong>
          舉辦。造成各位在行程安排上的不便，主辦單位深感抱歉。為表達我們的誠意並回饋選手的支持，本次報名費用調整如下：
        </p>
        <ul class="text-gray-200 leading-loose mb-4 pl-5 space-y-2">
          <li>
            <strong class="text-white">1. 人人有感補償：</strong><br />
            報名費直接減免 <strong class="text-red-400">1,000 元</strong>，由我們承擔這份不便。
          </li>
          <li>
            <strong class="text-white">2. 年輕選手加碼：</strong><br />
            為鼓勵新秀參賽，隊伍中成員若為 <strong class="text-red-400">18 歲（含）以下</strong>，每位選手可再折抵 <strong class="text-red-400">200 元</strong>。
          </li>
        </ul>
        <p class="text-gray-200 leading-relaxed mb-2">
          雖然比賽延期，但好康福利沒有少！<br />
          📌 <strong class="text-white">最新時程與優惠：</strong>
        </p>
        <ul class="text-gray-200 leading-loose mb-4 pl-5 list-disc">
          <li>
            <strong class="text-white">報名最後衝刺：</strong> 5 月 22 日截止
          </li>
          <li>
            🎁 <strong class="text-white">早鳥專屬好禮：</strong> 只要在
            <strong class="text-red-400">5 月 1 日前</strong>
            提前完成繳費的隊伍，就能加碼享有「店家優惠券」等多項驚喜獎勵喔！
          </li>
        </ul>
        <p class="text-center font-bold text-orange-400 text-lg">
          快把握時間完成報名與繳費，我們 6/7 賽場見！
        </p>
      </div>
    </div>

    <!-- Tournament List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <section>
      <h2 class="text-2xl font-bold text-white mb-6 text-center">賽事一覽</h2>

      <div v-if="pending" class="text-center py-12 text-gray-400">
        載入中...
      </div>

      <div v-else-if="error" class="text-center py-12 text-accent-failed">
        無法載入賽事資料，請稍後再試。
      </div>

      <div v-else-if="tournaments?.length" class="flex flex-wrap justify-center gap-4">
        <NuxtLink
          v-for="t in tournaments"
          :key="t.id"
          :to="`/tournament/${t.slug}`"
          class="group block w-full sm:w-80 bg-surface-light border border-surface-border rounded-xl p-6 hover:border-primary/50 hover:bg-surface-lighter transition-all duration-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-white group-hover:text-primary transition-colors whitespace-pre-line">{{ t.name }}</h3>
            <span
              v-if="t.isActive"
              class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary"
            >
              進行中
            </span>
          </div>
          <p v-if="t.description" class="text-sm text-gray-400 line-clamp-2">
            {{ t.description }}
          </p>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>🏁 比賽日期：<strong class="text-white">2026/06/07（日）</strong></span>
            <span>📋 報名截止：<strong class="text-white">2026/05/22</strong></span>
            <span>💰 報名費：<strong class="text-white">4,500 元/隊</strong>（原價 5,500 元，已減免 1,000 元）</span>
          </div>
          <p class="mt-3 text-xs text-primary group-hover:underline">👉 點選此處能進入報名</p>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        目前沒有賽事。
      </div>
    </section>
    </div>

    <!-- Featured Prizes (暫時隱藏，模組保留) -->
    <section v-if="false && featuredPrizes?.length" class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-white mb-8 text-center">精選獎品</h2>
        <ClientOnly>
          <PrizeSwiper :prizes="featuredPrizes" :api-base="apiBase" />
        </ClientOnly>
        <div class="text-center mt-8">
          <NuxtLink
            to="/prizes"
            class="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            查看更多獎品
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Solo Registration -->
    <section class="py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative border-2 border-primary rounded-xl p-6 bg-primary/10 backdrop-blur">
          <h3 class="text-center text-xl font-bold text-primary mb-4">
            🙋 沒隊友也能戰！個人報名專區
          </h3>
          <p class="text-gray-200 leading-relaxed mb-4">
            想參賽但找不到隊友嗎？別擔心，主辦方幫你湊！
          </p>
          <ol class="text-gray-200 leading-loose mb-4 pl-5 space-y-2 list-decimal">
            <li>
              <strong class="text-white">先聯繫：</strong>私訊網頁下方的
              <a href="https://www.instagram.com/cyyc_airsoft/" target="_blank" rel="noopener" class="text-primary hover:text-primary/80 underline transition-colors">IG</a>
              讓主辦方知道你有意願（適合 1-2 人報名）。
            </li>
            <li>
              <strong class="text-white">幫組隊：</strong>只要湊滿 4 人，我們就會幫大家組成戰隊。
            </li>
            <li>
              <strong class="text-white">安心報名：</strong>如果最後人數湊不齊，我們會主動聯絡並全額退費。
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Sponsors Carousel -->
    <section v-if="sponsors?.length" class="py-12 bg-surface-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-white mb-8 text-center">贊助夥伴</h2>
        <ClientOnly>
          <SponsorSwiper :sponsors="sponsors" :api-base="apiBase" />
        </ClientOnly>
        <p class="text-center text-gray-400 mt-6 text-sm">歡迎更多贊助商聯絡贊助</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Tournament, Sponsor, Prize } from '~/types'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const backendBase = apiBase.replace(/\/api$/, '')

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Airsoft Racing',
        url: 'https://limitspeed.zeabur.app',
        description: '極限速度杯 Airsoft Contest — 氣槍競速電競賽事報名平台',
      }),
    },
  ],
})
useSeoMeta({
  title: 'Airsoft Racing - 極限速度杯氣槍競速賽',
  ogTitle: 'Airsoft Racing - 極限速度杯氣槍競速賽',
  description: '極限速度杯 Airsoft Contest — 氣槍競速電競賽事報名平台。4v4 搶旗模式 Speedsoft，線上報名、查看賽事與報名隊伍。',
  ogDescription: '極限速度杯 Airsoft Contest — 氣槍競速電競賽事報名平台。4v4 搶旗模式 Speedsoft，線上報名、查看賽事與報名隊伍。',
  ogImage: `${backendBase}/public/banner.webp`,
  twitterTitle: 'Airsoft Racing - 極限速度杯氣槍競速賽',
  twitterDescription: '極限速度杯 Airsoft Contest — 4v4 搶旗模式 Speedsoft 氣槍競速電競賽事，立即線上報名！',
  twitterImage: `${backendBase}/public/banner.webp`,
})

const { data: tournaments, pending, error } = await useFetch<Tournament[]>('/tournaments', {
  baseURL: apiBase,
})

const { data: sponsors } = useLazyFetch<Sponsor[]>('/sponsors', {
  baseURL: apiBase,
  key: 'public-sponsors',
})

const { data: featuredPrizes } = useLazyFetch<Prize[]>('/prizes/featured', {
  baseURL: apiBase,
  key: 'featured-prizes',
})

// Use the active tournament's banner from backend
const bannerSrc = computed(() => {
  const active = tournaments.value?.find(t => t.isActive)
  const path = active?.bannerUrl
  if (!path) return null
  return path.startsWith('/') ? `${backendBase}${path}` : path
})
</script>
