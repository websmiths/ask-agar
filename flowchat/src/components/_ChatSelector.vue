<script setup>
import { useFlowStore } from '@/stores/flow.js'
import { storeToRefs } from 'pinia'
const { currentChatId } = storeToRefs(useFlowStore())

const chatIds = [
  { id: 'ask-agar-claude', label: 'Ask Agar - Claude' },
  { id: 'ask-agar-openai', label: 'Ask Agar - Open AI' },
  // { id: 'j-event-control', label: 'Julian – experiment 2' },
]
</script>

<template>
  <div
    id="chat-selector"
    class="button-group"
  >
    <button
      v-for="chat in chatIds"
      :key="chat.id"
      :class="{
        'button-secondary': chat.id === currentChatId,
      }"
      @click="currentChatId = chat.id"
    >
      {{ chat.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
#chat-selector {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: stretch;
  gap: 0;
  z-index: 100;

  > * {
    flex: 1;
  }
}
</style>
