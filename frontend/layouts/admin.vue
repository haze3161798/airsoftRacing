<template>
  <div class="min-h-screen bg-surface">
    <header class="bg-surface-light border-b border-surface-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <NuxtLink to="/admin/dashboard" class="shrink-0">
          <img :src="logoSrc" alt="Airsoft Racing" class="h-7 w-auto" />
        </NuxtLink>
        <span class="text-gray-400 font-normal text-sm">Admin</span>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const logoSrc = `${(config.public.apiBase as string).replace(/\/api$/, '')}/public/logo.svg`
</script>
