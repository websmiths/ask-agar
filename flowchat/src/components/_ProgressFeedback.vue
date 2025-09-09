<script setup>
import { computed } from 'vue'
import { useFlowStore } from '@/stores/flow'
const flowStore = useFlowStore()

import EllipsisBounce from '@/components/_EllipsisBounce.vue'

const current = computed(() => flowStore.compiledFeedbackMessages.at(-1))
const rest = computed(() => flowStore.compiledFeedbackMessages.slice(0, -1))
</script>

<template>
  <div class="progress-feedback">
    <ul v-if="current">
      <li
        v-for="item in rest"
        :key="item"
      >
        {{ item }}
      </li>
      <li class="current">{{ current }} <EllipsisBounce /></li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.progress-feedback {
  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    color: var(--brand-grey-light);
    opacity: 0.7;
    font-style: italic;
    font-size: 0.9rem;

    &.current {
      opacity: 9;
    }
  }
}
</style>
