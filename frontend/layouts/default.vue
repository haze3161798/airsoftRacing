<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-surface-light border-b border-surface-border sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 class="shrink-0 m-0 p-0 leading-none">
          <NuxtLink to="/">
            <img :src="logoSrc" alt="Airsoft Racing - 極限速度杯氣槍競速賽" class="h-8 sm:h-9 w-auto" />
          </NuxtLink>
        </h1>

        <!-- Desktop nav -->
        <nav aria-label="主選單" class="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <NuxtLink to="/tournament/season-1" class="nav-link hover:text-primary transition-colors">
            立即報名
          </NuxtLink>
          <NuxtLink to="/tournament/season-1/teams" class="nav-link hover:text-primary transition-colors">
            查看報名隊伍
          </NuxtLink>
          <NuxtLink to="/prizes" class="nav-link hover:text-primary transition-colors">
            獎品一覽
          </NuxtLink>
          <a
            v-if="pdfUrl"
            :href="pdfUrl"
            target="_blank"
            rel="noopener"
            class="nav-link hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下載規則 (PDF)
          </a>
        </nav>

        <!-- Mobile hamburger button -->
        <button
          class="md:hidden text-gray-300 hover:text-primary transition-colors"
          aria-label="選單"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <!-- Hamburger / X icon -->
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu dropdown -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden bg-surface-light border-b border-surface-border">
          <nav aria-label="行動版選單" class="px-4 py-4 space-y-3 text-sm">
            <NuxtLink
              to="/tournament/season-1"
              class="block text-gray-300 hover:text-primary transition-colors py-2"
              @click="mobileMenuOpen = false"
            >
              立即報名
            </NuxtLink>
            <NuxtLink
              to="/tournament/season-1/teams"
              class="block text-gray-300 hover:text-primary transition-colors py-2"
              @click="mobileMenuOpen = false"
            >
              查看報名隊伍
            </NuxtLink>
            <NuxtLink
              to="/prizes"
              class="block text-gray-300 hover:text-primary transition-colors py-2"
              @click="mobileMenuOpen = false"
            >
              獎品一覽
            </NuxtLink>
            <a
              v-if="pdfUrl"
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-1 text-gray-300 hover:text-primary transition-colors py-2"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下載規則 (PDF)
            </a>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-surface-light border-t border-surface-border py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 space-y-2">
        <div>
          <a
            href="https://www.instagram.com/cyyc_airsoft/"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <defs>
                <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stop-color="#fdf497" />
                  <stop offset="5%" stop-color="#fdf497" />
                  <stop offset="45%" stop-color="#fd5949" />
                  <stop offset="60%" stop-color="#d6249f" />
                  <stop offset="90%" stop-color="#285AEB" />
                </radialGradient>
              </defs>
              <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @cyyc_airsoft
          </a>
        </div>
        <div>
          &copy; {{ new Date().getFullYear() }} Airsoft Racing. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Tournament } from '~/types'

const config = useRuntimeConfig()
const mobileMenuOpen = ref(false)
const backendBase = (config.public.apiBase as string).replace(/\/api$/, '')
const logoSrc = `${backendBase}/public/logo.svg`
const faviconSrc = `${backendBase}/public/favicon.svg`

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: faviconSrc }],
})

// Fetch active tournament to get PDF URL
const { data: tournaments } = await useFetch<Tournament[]>('/tournaments', {
  baseURL: config.public.apiBase as string,
})

const activeTournament = computed(() => tournaments.value?.find(t => t.isActive))

const pdfUrl = computed(() => {
  const path = activeTournament.value?.rulesPdfUrl
  if (!path) return null
  // If it's a relative path, prepend the API base (without /api)
  if (path.startsWith('/')) {
    const base = (config.public.apiBase as string).replace(/\/api$/, '')
    return `${base}${path}`
  }
  return path
})

// Close mobile menu on route change
const route = useRoute()
watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.nav-link {
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background-color: #FF5500;
  transition: width 0.3s ease;
}
.nav-link:hover::after {
  width: 100%;
}
</style>
