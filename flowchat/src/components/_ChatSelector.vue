<script setup>
import { useFlowStore } from '@/stores/flow.js'
import { storeToRefs } from 'pinia'
const { currentChatId } = storeToRefs(useFlowStore())

const chatIds = ['ask-agar-claude', 'j-event-control']


</script>

<template>
  <div
    class="btn-group btn-group-toggle fixed-bottom"
    data-toggle="buttons"
  >
    <button
      v-for="chat in chatIds"
      :key="chat"
      class="btn btn-sm"
      :class="{
        'inactive': chat !== currentChatId,
      }"
      @click="currentChatId = chat"
    >
      {{ chat }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.inactive {
  background: #341e1b;
  &:hover {
    background: var(--bs-tertiary);
  }
}
</style>
