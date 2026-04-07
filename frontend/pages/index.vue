<template>
  <div>
    <!-- Hero Banner -->
    <section v-if="bannerSrc" class="relative w-full overflow-hidden bg-surface-light" style="aspect-ratio: 3 / 1;">
      <img
        :src="bannerSrc"
        alt="極限速度杯 Airsoft Contest — 氣槍競速電競賽事宣傳圖"
        class="absolute inset-0 w-full h-full object-cover"
      />
     
    </section>

    <!-- Announcement Banner -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
      <div class="relative border-2 border-orange-500 rounded-xl p-6 bg-orange-500/10 backdrop-blur">
        <h3 class="text-center text-xl font-bold text-orange-400 mb-4">
          ⚠️ 賽事日期異動與早鳥優惠公告 ⚠️
        </h3>
        <p class="text-gray-200 leading-relaxed mb-3">
          非常抱歉地通知大家，因場地協調因素，我們的比賽將延後至
          <strong class="text-red-400">6 月 7 日（日）</strong>
          舉辦。造成大家的困擾，主辦單位真的非常抱歉！🙇‍♂️
        </p>
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
            <span>🏁 比賽日期：<strong class="text-white">2026/06/07（六）</strong></span>
            <span>📋 報名截止：<strong class="text-white">2026/05/22</strong></span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        目前沒有賽事。
      </div>
    </section>
    </div>

    <!-- Sponsors Carousel -->
    <section v-if="sponsors?.length" class="py-12 bg-surface-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-white mb-8 text-center">贊助夥伴</h2>
        <ClientOnly>
          <SponsorSwiper :sponsors="sponsors" :api-base="apiBase" />
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Tournament, Sponsor } from '~/types'

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
  ogImage: `${backendBase}/public/banner.png`,
  twitterTitle: 'Airsoft Racing - 極限速度杯氣槍競速賽',
  twitterDescription: '極限速度杯 Airsoft Contest — 4v4 搶旗模式 Speedsoft 氣槍競速電競賽事，立即線上報名！',
  twitterImage: `${backendBase}/public/banner.png`,
})

const { data: tournaments, pending, error } = await useFetch<Tournament[]>('/tournaments', {
  baseURL: apiBase,
})

const { data: sponsors } = useLazyFetch<Sponsor[]>('/sponsors', {
  baseURL: apiBase,
  key: 'public-sponsors',
})

// Use the active tournament's banner from backend
const bannerSrc = computed(() => {
  const active = tournaments.value?.find(t => t.isActive)
  const path = active?.bannerUrl
  if (!path) return null
  return path.startsWith('/') ? `${backendBase}${path}` : path
})
</script>
