<script setup>
import { useFlowStore } from '@/stores/flow.js'
import { storeToRefs } from 'pinia'

import ProductSuggestion from '@/components/_ProductSuggestion.vue'

const { recommendation, filteredShortlist } = storeToRefs(useFlowStore())
</script>

<template>
  <section class="text-light">
    <template v-if="recommendation.name || filteredShortlist.length">
      <h4>Suggested product</h4>
      <ProductSuggestion
        v-if="recommendation"
        :product="recommendation"
      />

      <template v-if="filteredShortlist.length">
        <h5 class="mt-4">Shortlisted alternatives</h5>

        <ProductSuggestion
          v-for="product in filteredShortlist"
          :key="product.name"
          :product="product"
        />
      </template>
    </template>
  </section>
</template>

<style scoped lang="scss"></style>
