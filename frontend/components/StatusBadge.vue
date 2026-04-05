<template>
  <span :class="badgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { TeamStatus } from '~/types'

const props = defineProps<{ status: TeamStatus }>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'SUCCESS':
      return 'bg-accent-success/20 text-accent-success'
    case 'PENDING':
      return 'bg-accent-pending/20 text-accent-pending'
    case 'FAILED':
      return 'bg-accent-failed/20 text-accent-failed'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
})

const label = computed(() => {
  switch (props.status) {
    case 'SUCCESS': return '報名成功'
    case 'PENDING': return '審核中'
    case 'FAILED': return '報名失敗'
    default: return props.status
  }
})
</script>
