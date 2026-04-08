<template>
  <div class="min-h-screen bg-surface">
    <header class="bg-surface-light border-b border-surface-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <NuxtLink to="/admin/dashboard" class="shrink-0">
          <img :src="logoSrc" alt="Airsoft Racing" class="h-7 w-auto" />
        </NuxtLink>
        <span class="text-gray-400 font-normal text-sm">Admin</span>
        <nav class="ml-4 flex gap-3">
          <NuxtLink
            to="/admin/dashboard"
            class="text-sm text-gray-400 hover:text-white transition-colors"
            active-class="!text-primary font-semibold"
          >
            報名審核
          </NuxtLink>
          <NuxtLink
            to="/admin/sponsors"
            class="text-sm text-gray-400 hover:text-white transition-colors"
            active-class="!text-primary font-semibold"
          >
            贊助商管理
          </NuxtLink>
          <NuxtLink
            to="/admin/prizes"
            class="text-sm text-gray-400 hover:text-white transition-colors"
            active-class="!text-primary font-semibold"
          >
            獎品管理
          </NuxtLink>
        </nav>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const backendBase = (config.public.apiBase as string).replace(/\/api$/, '')
const logoSrc = `${backendBase}/public/logo.svg`
const faviconSrc = `${backendBase}/public/favicon.svg`

useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: faviconSrc }],
})
</script>
