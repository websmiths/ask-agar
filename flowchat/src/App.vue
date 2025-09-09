<script setup>
import { useTemplateRef } from 'vue'
import { useFlowStore } from '@/stores/flow.js'
const flowStore = useFlowStore()

import FlowChat from '@/components/FlowChat.vue'
import Suggestions from '@/components/Suggestions.vue'

import ChatSelector from '@/components/_ChatSelector.vue'

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

const chatContainer = useTemplateRef('chatContainer')

// Place this in your <script setup> block or a separate JS file
import { onMounted } from 'vue'

function closeChat() {
  flowStore.chatExpanded = false
  chatContainer.value.removeAttribute('style')
}

onMounted(() => {
  const container = document.querySelector('.chat-interface')
  const handle = document.getElementById('drag-handle')

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

  function setColumns(leftPercent) {
    if (!flowStore.chatExpanded) return
    const rect = container.getBoundingClientRect()
    const handlePx = handle.offsetWidth // fixed
    const left = clamp(
      leftPercent,
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--min-left',
        ),
      ),
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--max-left',
        ),
      ),
    )
    const right = 100 - left - (handlePx / rect.width) * 100
    container.style.gridTemplateColumns = `${left}% ${handlePx}px ${right}%`
  }

  // ----- Mouse drag -----
  let dragging = false

  function onMouseDown(e) {
    if (!flowStore.chatExpanded) return
    dragging = true
    container.classList.add('dragging')
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp, { once: true })
  }

  function onMouseMove(e) {
    if (!dragging) return
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const leftPct = (x / rect.width) * 100
    setColumns(leftPct)
  }

  function onMouseUp() {
    dragging = false
    container.classList.remove('dragging')
    window.removeEventListener('mousemove', onMouseMove)
  }

  handle.addEventListener('mousedown', onMouseDown)

  // ----- Touch drag -----
  function onTouchStart(e) {
    e.preventDefault()
    dragging = true
    container.classList.add('dragging')
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { once: true })
    window.addEventListener('touchcancel', onTouchEnd, { once: true })
  }

  function onTouchMove(e) {
    if (!dragging) return
    const t = e.touches[0]
    const rect = container.getBoundingClientRect()
    const x = t.clientX - rect.left
    const leftPct = (x / rect.width) * 100
    setColumns(leftPct)
  }

  function onTouchEnd() {
    dragging = false
    container.classList.remove('dragging')
    window.removeEventListener('touchmove', onTouchMove)
  }

  handle.addEventListener('touchstart', onTouchStart, { passive: false })

  /*
    // ----- Keyboard (accessibility) -----
    handle.addEventListener('keydown', e => {
      const step = e.shiftKey ? 5 : 2 // arrow = 2%, shift+arrow = 5%
      const [leftValue] =
        getComputedStyle(container).gridTemplateColumns.split(' ')
      let left = parseFloat(leftValue) // assumes % for the first track
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setColumns(left - step)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setColumnsft + step)
      }
    })
  /*
    // Keep layout responsive when container resizes
    new ResizeObserver(() => {
      console.log('resize')
      if (!flowStore.chatExpanded) return
      const [leftValue] =
        getComputedStyle(container).gridTemplateColumns.split(' ')
      setColumns(parseFloat(leftValue))
    }).observe(container)
    */
})
</script>

<template>
  <div id="flowChat">
    <div
      class="chat-interface"
      ref="chatContainer"
      :class="{ 'chat-expanded': flowStore.chatExpanded }"
    >
      <div class="close-chat">
        <button
          class="btn-close"
          @click="closeChat"
        />
      </div>
      <FlowChat
        class="chat"
        submit-label="Ask Agar"
        :startup-prompts
      />
      <div id="drag-handle"></div>
      <Suggestions />
    </div>

    <ChatSelector />
  </div>
  <!--  <pre>{{ flowStore.flowState }}</pre>-->
</template>

<style lang="scss">
:root {
  --handle-w: 8px;
  --min-left: 25; /* % */
  --max-left: 85; /* % */
}

#flowChat {
  color: #000;

  &:has(.chat-expanded) {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
  }

  .btn {
    height: unset !important;
  }

  .chat-interface {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    gap: 0;
    height: 3rem;
    bottom: 2px;
    border-radius: 0.3em;
    margin-left: 2rem;

    // to reset some agar stuff
    text-align: left;

    transition:
      grid-template-columns 120ms ease,
      height 0.5s ease-in-out;

    position: relative;

    .close-chat {
      position: absolute;
      right: 0.5rem;
      top: -2rem;
    }

    &.chat-expanded {
      grid-template-columns: 80% var(--handle-w) calc(20% - var(--handle-w));
      height: 80vh;
      width: 80vw;
      margin: 0 auto;
      background: #fff;
      padding: 1rem;
      top: 3rem;
    }

    .suggestions,
    .close-chat,
    .conversation {
      transition: opacity 0.6s ease-in-out;
    }

    &:not(.chat-expanded) {
      #drag-handle,
      .suggestions,
      .close-chat,
      .conversation {
        opacity: 0;
        margin: 0;
        padding: 0;
        transition: opacity 0.3s ease-in-out;
      }
    }

    #drag-handle {
      position: relative;
      width: var(--handle-w);
      cursor: col-resize;

      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;

      background-color: #fff;
      transition:
        background-color 0.6s ease-in-out,
        border 0.6s ease-in-out;

      &:hover {
        background-color: #e5e7eb;
      }

      &::before {
        content: '';
        width: 2px;
        height: 24px;
        box-shadow:
          0 -10px 0 0 #94a3b8,
          0 -5px 0 0 #94a3b8,
          0 0 0 0 #94a3b8,
          0 5px 0 0 #94a3b8,
          0 10px 0 0 #94a3b8;
        border-radius: 1px;
        opacity: 0.6;
        pointer-events: none;
      }

      &:hover {
        cursor: ew-resize;
      }
    }

    section.suggestions {
      padding: 1rem;
      border-radius: 0.4em;
      border: 1px solid var(--brand-primary);
      background: var(--brand-primary);
    }
  }
}
</style>
