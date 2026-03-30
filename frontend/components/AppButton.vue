<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClass, variantClass, { 'opacity-50 cursor-not-allowed': disabled || loading }]"
    class="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

const baseClass = 'rounded-lg'

const variantClass = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary hover:bg-primary-600 text-white',
    secondary: 'bg-surface-lighter hover:bg-surface-border text-white border border-surface-border',
    danger: 'bg-accent-failed hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-surface-lighter text-gray-300',
  }
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return `${variants[props.variant || 'primary']} ${sizes[props.size || 'md']}`
})
</script>
