<script setup>

const { prompts } = defineProps({
  prompts: {
    type: Array,
    default: () => [],
  }
})

const emit = defineEmits(['ask-flow'])

const askFlow = prompt => {
  emit('ask-flow', prompt)
}

</script>

<template>
  <div
    v-if="prompts.length"
    class="follow-up-questions"
  >
    <button
      v-for="prompt in prompts"
      type="button"
      class="follow-up prompt"
      @click="askFlow(prompt)"
    >
      {{ prompt }}
    </button>
  </div>



</template>

<style scoped lang="scss">

</style>
