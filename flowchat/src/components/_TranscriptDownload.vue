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

const generateLead = fields => {

  console.log('generateLead', fields)

  const name = fields.target.querySelector('#name').value || ''
  const email = fields.target.querySelector('#email').value

  console.log('name', name)
  console.log('email', email)


  createLead({ email, name }).catch(e => console.error(e))

  dialog.value.close()

}

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
</script>

<template>
  <button
    @click="openDialog"
    class="btn"
  >
    Email Transcript
  </button>

  <dialog
    id="get-details"
    ref="get-details"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Email Transcript</h5>
        <button
          type="button"
          class="btn-close"
          @click="dialog.close()"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <p>
          Enter your details and we’ll send you a link to download your
          transcript.
        </p>
        <form @submit.prevent="generateLead">
          <p class="d-flex gap-2">
            <label for="name">Name</label>
            <input
              id="name"
              name="name"
              placeholder="Enter your name"
            />
          </p>
          <p class="d-flex gap-2">
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
              class="btn w-100"
            >
              Submit
            </button>
          </p>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
dialog {
  background: transparent;
  border: none;
}

::backdrop {
  background-image: linear-gradient(
    45deg,
    magenta,
    rebeccapurple,
    dodgerblue,
    green
  );
  opacity: 0.75;
}

input {
  width: 100%;
}

.btn-close {
  --bs-btn-close-color: #000;
  --btn-size: .8rem;
}

</style>
