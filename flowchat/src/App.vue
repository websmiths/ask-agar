<script setup>
import { shallowRef } from 'vue'
import { useFlowStore } from '@/stores/flow.js'
const flowStore = useFlowStore()

import FlowChat from '@/components/FlowChat.vue'
import Suggestions from '@/components/Suggestions.vue'

/*
 * Todo:
 *
 * Store session ID for later retrieval
 *
 * */

const startupPrompts = [
  'What’s best for cleaning oil from sandstone?',
  'What is the best product for cleaning kitchen floors',
  'Where can I buy Agar products?',
  'Tell me about Oil Cleaning products',
]

</script>

<template>
  <div id="ask-agar-wrapper">
    <div
      class="chat-interface"
      :class="{ 'chat-expanded': flowStore.chatExpanded }"
    >
      <div class="close-chat">
        <button
          class="btn-close"
          @click="flowStore.chatExpanded = false"
        />
      </div>
      <FlowChat
        class="chat"
        submit-label="Ask Agar"
        :startup-prompts
      />
      <Suggestions class="suggestions" />
    </div>
  </div>
  <!--  <pre>{{ flowStore.flowState }}</pre>-->
</template>

<style lang="scss">
#ask-agar-wrapper {
  &:has(.chat-expanded) {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    background: rgba(0, 0, 0, 0.5);
  }


  .btn {
    height: unset !important;
  }


  .chat-interface {
    display: flex;
    gap: 0;
    height: 3rem;
    top: 0;
    border-radius: 0.3em;

    // to reset some agar stuff
    text-align: left;

    //transition: height 0.6s ease-in-out;
    transition: all 0.6s ease-in-out;

    position: relative;

    .close-chat {
      position: absolute;
      right: 0;
      top: -2rem;
    }

    &.chat-expanded {
      height: 80vh;
      width: 80vw;
      margin: 0 auto;
      background: #fff;
      padding: 1rem;
      gap: 1rem;
      top: 3rem;
    }

    .suggestions,
    .close-chat,
    .conversation {
      transition: all 0.6s ease-in-out;
    }

    &:not(.chat-expanded) {
      .suggestions,
      .close-chat,
      .conversation {
        opacity: 0;
        //height: 0;
        margin: 0;
        padding: 0;
      }

      .suggestions {
        flex: 0 1 0;
        padding: 0;
      }
    }

    > section {
      flex: 1 1 auto;

      &.chat {
        flex-basis: 80%;
      }

      &.suggestions {
        flex-basis: 20%;
        padding: 1rem;
        border-radius: 0.4em;
        border: 1px solid var(--bs-primary);
        background: var(--bs-primary);
      }
    }
  }
}
</style>
