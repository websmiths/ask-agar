<script setup>
import { useFlowStore } from '@/stores/flow.js'
import { storeToRefs } from 'pinia'
const { recommendation, filteredShortlist, extraInfo } =
  storeToRefs(useFlowStore())

import ProductSuggestion from '@/components/_ProductSuggestion.vue'
</script>

<template>
  <section class="suggestions">
    <div class="product-suggestions">
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
    </div>

    <div class="extra-info">
      <template v-if="extraInfo">
        <div
          v-for="item in extraInfo"
          :key="item"
          v-html="item"
          class="extra-info-item"
        />
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../assets/scss/mixins';

.suggestions {
  @include mixins.null-y-margins;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;

  .extra-info-item {
    background: var(--brand-light);
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.85rem;
    color: var(--brand-grey);
    margin-bottom: 0.5rem;
  }

}
</style>
