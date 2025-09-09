<script setup>
import { useTemplateRef } from 'vue'

import { useFlowStore } from '@/stores/flow.js'
const { createLead } = useFlowStore()

import TurndownService from 'turndown'

const turndownService = new TurndownService()

const props = defineProps({
  transcript: {
    type: String,
    default: () => [],
  },
})

const dialog = useTemplateRef('get-details')
const openDialog = () => {
  dialog.value.showModal()
}

const toast = useTemplateRef('liveToast')
const toggleToast = () => {
  toast.value.classList.toggle('hide')
  toast.value.classList.toggle('show')
}

const generateLead = fields => {
  console.log('generateLead', fields)

  const name = fields.target.querySelector('#name').value || ''
  const email = fields.target.querySelector('#email').value

  console.log('name', name)
  console.log('email', email)

  createLead({ email, name }).catch(e => console.error(e))

  dialog.value.close()
  toggleToast()
  setTimeout(toggleToast, 3000)
}

/*

const downloadTranscript = () => {
  const element = document.getElementById('ask-agar-wrapper')
  const filename = `agar-chat-transcript-${new Date().toISOString()}`

  console.log('element', element)

  const opt = {
    margin: 1,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  // New Promise-based usage:
  html2pdf().set(opt).from(element.innerHTML).save()

  console.log('downloadTranscript', props.transcript)

  const html = element.innerHTML
  const markdown = turndownService.turndown(html)

  console.log('markdown', markdown)

  downloadTextFile(props.transcript, `${filename}-props.txt`)
  downloadTextFile(markdown, `${filename}-parsed-from-dom.txt`)
}

function downloadTextFile(text, filename) {
  // Optional BOM for better UTF-8 handling in some editors (Windows Notepad, etc.)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM, text], { type: 'text/plain;charset=utf-8' })

  // Standard download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a) // needed for Firefox
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
*/
</script>

<template>
  <button
    @click="openDialog"
    class="button-secondary"
  >
    Email Transcript
  </button>

  <dialog
    id="get-details"
    ref="get-details"
  >
    <div class="dialog-content">
      <div class="dialog-header">
        <h5>Email Transcript</h5>
        <button
          type="button"
          class="btn-close"
          @click="dialog.close()"
          aria-label="Close"
        ></button>
      </div>
      <div class="dialog-body">
        <p>
          Enter your details and we’ll send you a link to download your
          transcript.
        </p>
        <form @submit.prevent="generateLead">
          <p class="input-group">
            <label for="name">Name</label>
            <input
              id="name"
              name="name"
              placeholder="Enter your name"
            />
          </p>
          <p class="input-group">
            <label for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
            />
          </p>
          <p>
            <button
              type="submit"
              class="button-secondary"
            >
              Submit
            </button>
          </p>
        </form>
      </div>
    </div>
  </dialog>

  <div
    ref="liveToast"
    class="toast-message hide"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div class="toast-message-header">
      <h6 class="m-0">Thanks</h6>
      <button
        type="button"
        class="ml-2 mb-1 btn-close"
        aria-label="Close"
        @click="toggleToast"
      />
    </div>
    <div class="toast-message-body">
      Thank you. We will be in touch shortly.
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/scss/mixins';

dialog {
  //background: transparent;
  border: none;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.5);
  margin: auto;
  border-radius: var(--dialog-border-radius);
  padding: 0;
}

::backdrop {
  background-image: linear-gradient(45deg, #222, #111, #222);
  opacity: 0.75;
}

.dialog-header {
  @include mixins.flex-header;
  border-radius: var(--dialog-border-radius) var(--dialog-border-radius) 0 0;
  background-color: var(--brand-grey-light);
  padding: 0.5rem 1rem;

  h5 {
    font-size: 1.2rem;
    margin: 0;
    color: var(--brand-light);
  }
}

.dialog-body {
  padding: 1rem;
}

.btn-close {
  --button-close-color: #fff;
  --btn-size: 0.6rem;
}

.toast-message {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 5;
  border-radius: 0.25rem;
  opacity: 0.8;
  background-color: var(--brand-light);

  &.hide {
    display: none;
  }
  &.show {
    display: block;
  }

  * {
    color: inherit;
  }

  .toast-message-header {
    @include mixins.flex-header;
    background-color: var(--brand-secondary);
    color: var(--brand-light);
    padding: 0.5rem 1rem;
  }

  .toast-message-body {
    padding: 1rem;
    font-size: 0.9rem;
  }
}
</style>
