<template>
  <div class="prize-swiper-wrap">
    <div ref="swiperContainer" class="swiper">
      <div class="swiper-wrapper">
        <div
          v-for="p in prizes"
          :key="p.id"
          class="swiper-slide"
        >
          <div class="rounded-xl overflow-hidden bg-surface-light border border-surface-border">
            <!-- Image -->
            <div class="aspect-square bg-white/5 overflow-hidden">
              <img
                :src="`${apiBase}/prizes/${p.id}/image`"
                :alt="p.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <!-- Info -->
            <div class="p-3">
              <div class="flex items-start gap-2 mb-1">
                <h3 class="text-white font-bold text-sm leading-tight flex-1 truncate">{{ p.name }}</h3>
                <span
                  v-if="p.prizeTag"
                  class="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                >
                  {{ p.prizeTag.name }}
                </span>
              </div>
              <p v-if="p.sponsor" class="text-gray-500 text-xs truncate">
                贊助：{{ p.sponsor.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prize } from '~/types'
import Swiper from 'swiper'
import { EffectCards, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/pagination'

const props = defineProps<{
  prizes: Prize[]
  apiBase: string
}>()

const swiperContainer = ref<HTMLElement | null>(null)
let swiperInstance: Swiper | null = null

function initSwiper() {
  swiperInstance?.destroy()
  swiperInstance = null

  nextTick(() => {
    if (swiperContainer.value && props.prizes.length) {
      swiperInstance = new Swiper(swiperContainer.value, {
        modules: [EffectCards, Pagination, Autoplay],
        effect: 'cards',
        grabCursor: true,
        cardsEffect: {
          perSlideOffset: 8,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: false,
        },
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      })
    }
  })
}

onMounted(initSwiper)

watch(() => props.prizes, initSwiper)

onBeforeUnmount(() => {
  swiperInstance?.destroy()
})
</script>

<style scoped>
.prize-swiper-wrap {
  max-width: 320px;
  margin: 0 auto;
  overflow: hidden;
  padding: 20px 0 50px;
}

.prize-swiper-wrap .swiper {
  overflow: visible;
}

.prize-swiper-wrap .swiper-slide {
  border-radius: 12px;
}

.prize-swiper-wrap :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.3);
  opacity: 1;
}

.prize-swiper-wrap :deep(.swiper-pagination-bullet-active) {
  background: var(--color-primary, #ff6600);
}
</style>
