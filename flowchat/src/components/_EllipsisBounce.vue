<script setup lang="ts"></script>

<template>
  <span class="ellipsis"><span>.</span><span>.</span><span>.</span></span>
</template>

<style scoped lang="scss">
@keyframes bounce {
  from {
    transform: translateY(0);
  }
  10% {
    transform: translateY(-2px);
  }
  20% {
    transform: translateY(1px);
  }
  30% {
    transform: translateY(0);
  }
}

.ellipsis {
  span {
    animation: bounce 2s ease-in-out infinite;
    display: inline-block;
    &:nth-child(2) {
      animation-delay: 0.1s;
    }
    &:nth-child(3) {
      animation-delay: 0.2s;
    }
  }
}
</style>
