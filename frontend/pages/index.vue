<template>
  <div>
    <!-- Hero Banner -->
    <section v-if="bannerSrc" class="relative w-full overflow-hidden bg-surface-light" style="aspect-ratio: 3 / 1;">
      <img
        :src="bannerSrc"
        alt="Airsoft Racing 宣傳圖"
        class="absolute inset-0 w-full h-full object-cover"
      />
     
    </section>

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
