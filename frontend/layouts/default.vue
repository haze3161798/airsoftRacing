<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-surface-light border-b border-surface-border sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="shrink-0">
          <img :src="logoSrc" alt="Airsoft Racing" class="h-8 sm:h-9 w-auto" />
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <NuxtLink to="/tournament/season-1/register" class="nav-link hover:text-primary transition-colors">
            立即報名
          </NuxtLink>
          <NuxtLink to="/tournament/season-1/teams" class="nav-link hover:text-primary transition-colors">
            查看報名隊伍
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
          <nav class="px-4 py-4 space-y-3 text-sm">
            <NuxtLink
              to="/tournament/season-1/register"
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Airsoft Racing. All rights reserved.
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
