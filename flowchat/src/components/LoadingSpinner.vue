<script setup>
import { computed, onUpdated, onMounted } from 'vue'

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

onMounted(() => animate())
onUpdated(() => animate())

const animate = () => {
  const textToSplit = document.querySelector('.split')
  if (!textToSplit) return
  document.fonts.ready.then(() => {
    SplitText.create('.split', {
      type: 'chars',
      onSplit(self) {
        gsap.from(self.chars, {
          duration: 2,
          alpha: 0,
          y: 20,
          rotation: "random(-10,10)",
          ease: 'back.out(1.7)',
          stagger: {
            amount: 0.1,
            yoyo: true,
            repeat: -1,
            from: 'random',
          },
          autoAlpha: 0,
        })
      },
    })
  })
}

const props = defineProps({
  loadingMessage: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const loadingText = computed(
  () => props.loadingMessage /* || loadingMsg.value*/,
)
</script>

<template>
  <div
    v-if="isLoading"
    id="loading-spinner"
    class="text-center"
  >
    <div
      class="spinner-border text-primary"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
    <slot>
      <p class="split text-tertiary">{{ loadingText }}</p>
    </slot>
  </div>
</template>

<style scoped lang="scss">

</style>
