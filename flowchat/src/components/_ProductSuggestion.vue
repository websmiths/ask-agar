<script setup>
const { product } = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const badgeClass = score => {
  if (score >= 90) return 'bg-success'
  if (score >= 70) return 'bg-info'
  return 'bg-warning'
}
</script>

<template>
  <div class="product-suggestion text-light rounded bg-dark p-3 my-2">
    <!--      <pre class="text-break">{{ product }}</pre>-->
    <h5
      v-if="product.name"
      class="d-flex justify-content-between align-items-start text-light"
    >
      <span>{{ product.name }}</span>
      <span
        v-if="product.score"
        class="badge rounded-pill text-bg-light"
        :class="badgeClass(product.score)"
        >{{ product.score }}</span
      >
    </h5>
    <h6
      v-if="product.category"
      class="text-light"
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

    <p v-if="product.url">
      <a
        :href="product.url"
        target="_blank"
        class="btn btn-light btn-sm w-100 product-link p-y1 px-3"
      >
        <i class="link-icon" />
        Product link</a
      >
    </p>
  </div>
</template>

<style lang="scss">
.product-suggestion {
  :last-child {
    margin-bottom: 0;
  }

  .product-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .link-icon {
      margin: 0.2rem 0;
      width: 1rem;
      height: 1rem;
      -webkit-mask: url('/link.svg') no-repeat center;
      -webkit-mask-size: contain;
      mask: url('/assets/link.svg') no-repeat center;
      mask-size: contain;
      background-color: #fcffb7;
      background-size: contain;
    }
  }
}
</style>
