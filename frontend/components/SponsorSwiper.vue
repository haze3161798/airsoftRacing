<template>
  <div class="sponsor-swiper-wrap">
    <div ref="swiperContainer" class="swiper">
      <div class="swiper-wrapper">
        <div
          v-for="s in sponsors"
          :key="s.id"
          class="swiper-slide"
        >
          <component
            :is="s.linkUrl ? 'a' : 'div'"
            v-bind="s.linkUrl ? { href: s.linkUrl, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="block rounded-xl overflow-hidden bg-white/5 border border-surface-border hover:border-primary/40 transition-all duration-200 p-4 flex items-center justify-center"
            :class="s.linkUrl ? 'cursor-pointer' : 'cursor-default'"
            style="aspect-ratio: 4 / 3;"
          >
            <img
              :src="`${apiBase}/sponsors/${s.id}/image`"
              :alt="s.name"
              class="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </component>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sponsor } from '~/types'
import Swiper from 'swiper'
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

const props = defineProps<{
  sponsors: Sponsor[]
  apiBase: string
}>()

const swiperContainer = ref<HTMLElement | null>(null)
let swiperInstance: Swiper | null = null

function initSwiper() {
  swiperInstance?.destroy()
  swiperInstance = null

  nextTick(() => {
    if (swiperContainer.value) {
      swiperInstance = new Swiper(swiperContainer.value, {
        modules: [EffectCoverflow, Pagination, Autoplay],
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: props.sponsors.length >= 5,
        coverflowEffect: {
          rotate: 20,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false,
        },
        autoplay: {
          delay: 3000,
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

watch(() => props.sponsors, initSwiper)

onBeforeUnmount(() => {
  swiperInstance?.destroy()
})
</script>

<style scoped>
.sponsor-swiper-wrap {
  max-width: 900px;
  margin: 0 auto;
}

.sponsor-swiper-wrap .swiper {
  padding-bottom: 40px;
}

.sponsor-swiper-wrap .swiper-slide {
  width: 240px;
  transition: transform 0.3s;
}

@media (max-width: 640px) {
  .sponsor-swiper-wrap .swiper-slide {
    width: 180px;
  }
}

.sponsor-swiper-wrap :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.3);
  opacity: 1;
}

.sponsor-swiper-wrap :deep(.swiper-pagination-bullet-active) {
  background: var(--color-primary, #ff6600);
}
</style>
