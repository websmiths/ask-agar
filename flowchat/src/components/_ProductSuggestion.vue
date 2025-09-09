<script setup>
const { product } = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const badgeClass = score => {
  if (score >= 90) return 'brand-success'
  if (score >= 70) return 'brand-info'
  return 'brand-warning'
}
</script>

<template>
  <div class="product-suggestion">
    <h5
      v-if="product.name"
      class="product-name"
    >
      <span>{{ product.name }}</span>
      <span
        v-if="product.score"
        class="score-badge rounded-pill text-bg-light"
        :class="badgeClass(product.score)"
        >{{ product.score }}</span
      >
    </h5>
    <h6
      v-if="product.category"
      class="product-category"
    >
      {{ product.category }}
    </h6>

    <p v-if="product.image_url">
      <img
        :src="product.image_url"
        :alt="product.name"
        class="img-fluid"
      />
    </p>

    <div
      v-if="product.url || product.data_sheet_url || product.safety_sheet_url"
      class="product-links"
    >
      <a
        v-if="product.url"
        :href="product.url"
        target="_blank"
        class="button product-link button-secondary"
      >
        <i class="btn-link-icon button-icon" />
        Product link
        <i class="external-link-icon button-icon" />
      </a>

      <a
        v-if="product.data_sheet_url"
        :href="product.data_sheet_url"
        target="_blank"
        class="button product-link button-secondary"
      >
        <i class="btn-link-icon button-icon" />
        Data sheet
        <i class="download-icon button-icon" />
      </a>

      <a
        v-if="product.safety_sheet_url"
        :href="product.safety_sheet_url"
        target="_blank"
        class="button product-link button-secondary"
      >
        <i class="btn-link-icon button-icon" />
        Safety sheet
        <i class="download-icon button-icon" />
      </a>
    </div>
  </div>
</template>

<style lang="scss">
@use '../assets/scss/mixins';

.product-suggestion {
  background: var(--brand-grey);
  color: var(--brand-light);
  border-radius: var(--brand-border-radius);
  padding: 0.8rem;
  margin: 0.4rem 0;

  :last-child {
    margin-bottom: 0;
  }

  h5 {
    @include mixins.flex-header;
    margin: 0 0 0.5em;
  }

  .score-badge {
    @include mixins.badge;

    &.brand-success {
      --badge-background: var(--brand-success);
    }
    &.brand-info {
      --badge-background: var(--brand-info);
    }
    &.brand-warning {
      --badge-background: var(--brand-warning);
    }
  }

  .product-category {
    margin: 0.7em 0;
  }

  .product-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .product-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    justify-content: flex-start;

    position: relative;

    .button-icon {
      --icon-colour: #fcffb7;
    }

    .external-link-icon,
    .download-icon {
      position: absolute;
      right: 0;
      margin: 0.2rem;
      --icon-opacity: 0.5;
    }

    .external-link-icon {
      top: 0;
    }

    .download-icon {
      --button-size: 0.7rem;
      bottom: 0;
      margin-right: .4rem;
    }
  }
}
</style>
