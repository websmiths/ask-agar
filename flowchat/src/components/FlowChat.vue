<script setup>
import { computed, ref, onUpdated, useId } from 'vue'
import { storeToRefs } from 'pinia'
import slug from 'slug'

// chat-responses

const { startupPrompts } = defineProps({
  startupPrompts: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Ask me something.',
  },
  submitLabel: {
    type: String,
    default: 'Ask',
  },
})

const wrapperId = useId()
const labelId = useId()

let conversationDiv = null

onUpdated(() => {
  if (!chatFlow.value?.length) return

  if (!conversationDiv) {
    conversationDiv = document.getElementById(wrapperId)
  }

  if (fetching.value) {
    conversationDiv.scroll({
      top: conversationDiv.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
    return
  }

  const lastItemId = chatFlow.value?.at(-1).id
  const lastItemOffset = document.getElementById(lastItemId)?.offsetTop

  if (!lastItemOffset) return

  conversationDiv.scroll({
    top: lastItemOffset - 50,
    left: 0,
    behavior: 'smooth',
  })

  // smoother.scrollTo(`#${lastItemId}`, true, 'center top')
})

/*
 * Todo:
 *
 * Store session ID for later retrieval
 *
 * */
import { useFlowStore } from '@/stores/flow.js'
const flowStore = useFlowStore()
const {
  question,
  fetching,
  currentStreamOutput,
  currentStream,
  currentFollowUpPrompts,
  readingStream,
  chatExpanded,
  shortlist,
} = storeToRefs(flowStore)
const { streamPrediction, resetChat } = flowStore

import markdownit from 'markdown-it'
const md = markdownit()

import LoadingSpinner from '@/components/LoadingSpinner.vue'

const flowQuery = ref('')
const chatFlow = ref([{}])

const showStartupPrompts = computed(
  () => !!startupPrompts.length && chatFlow.value.length < 2 && !fetching.value,
)

function reset() {
  resetChat()
  chatFlow.value = [{}]
}

const askFlow = prompt => {
  const isPrompt = typeof prompt === 'string'
  question.value = isPrompt ? prompt : flowQuery.value

  // reset suggestions if not prompt as the query may relate to a different product
  if (!isPrompt) {
    shortlist.value = []
  }

  /*agentUserMessage*/
  // append current stream to chatFlow
  if (chatFlow.value.length) {
    chatFlow.value.at(-1).html = currentStreamOutput.value.toString()
    // reset stream
    currentStream.value = ''
  }

  const chatItem = {
    question: question.value,
    id: slug(question.value),
  }
  chatFlow.value.push(chatItem)
  /*

  // create a lead if an email is found in the question
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/
  const emailMatch = question.value.match(emailPattern)
  if (emailMatch && !capturedResources.value.includes(emailMatch[0])) {
    capturedResources.value.push(emailMatch[0])
    createLead({ email: emailMatch[0] }).catch(e => console.error(e))
  }
*/

  streamPrediction()

  // clear input
  flowQuery.value = ''
}
</script>
<template>
  <section class="flowChat d-flex flex-column">
    <div
      :id="wrapperId"
      class="conversation pt-3"
    >
      <div id="chat-responses">
        <div
          v-for="item in chatFlow"
          class="response"
          :id="item.id"
        >
          <div
            v-if="item.question"
            class="d-flex gap-2 justify-content-end mt-4 mb-3"
          >
            <h4 class="userQuestion">{{ item.question }}</h4>
            <img
              src="/assets/user-icon.png"
              alt="User"
              class="avatar"
            />
          </div>
          <div class="d-flex gap-2">
            <img
              src="/assets/agar-icon.png"
              alt="Agar"
              class="avatar"
            />
            <div
              v-if="item?.html"
              v-html="item.html"
              class="chatResponse"
            />
            <div
              v-else-if="currentStreamOutput || readingStream"
              v-html="currentStreamOutput || '…'"
              class="chatResponse"
            />
          </div>
        </div>
      </div>

      <LoadingSpinner
        :is-loading="fetching"
        loading-message="Asking our agents…"
      />

      <div
        v-if="currentFollowUpPrompts.length"
        class="d-flex gap-2 follow-up-questions"
      >
        <button
          v-for="prompt in currentFollowUpPrompts"
          type="button"
          class="btn btn-sm follow-up"
          @click="askFlow(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </div>

    <form
      @submit.prevent="askFlow"
      @focusin="chatExpanded = true"
    >
      <div class="d-flex gap-1">
        <input
          :id="labelId"
          v-model="flowQuery"
          name="flowQuery"
          class="form-control"
        />

        <button
          type="submit"
          class="btn btn-primary text-nowrap"
          @click.prevent="askFlow"
        >
          {{ submitLabel }}
          <i
            v-if="!submitLabel"
            class="fa-solid fa-arrow-right"
          />
        </button>

        <button
          type="button"
          class="btn follow-up"
          @click="reset"
        >
          Reset Chat
        </button>
      </div>
    </form>

    <Transition appear>
      <div
        v-if="chatExpanded && showStartupPrompts"
        class="d-flex gap-2 follow-up-questions my-3"
      >
        <button
          v-for="prompt in startupPrompts"
          type="button"
          class="btn btn-sm follow-up"
          @click="askFlow(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </Transition>
  </section>
</template>

<style lang="scss">
.conversation,
.suggestions {
  overflow-y: auto;
  margin-bottom: 1.2rem;
  border-radius: 0.4rem;
}

.conversation {
  background-color: var(--bs-light);
  position: relative;
  flex-grow: 1;
  box-shadow: 0.1rem 0.14rem 0.6rem rgba(var(--bs-primary), 0.5) inset;
  transition: height 0.3s ease-in-out;

  #chat-responses {
    background: transparent;

    .avatar {
      width: 2rem;
      height: 2rem;
    }

    .response {
      padding: 0 1rem;

      animation: appear 1s ease-in-out;
      & > div {
        animation: appear 0.8s ease-in-out;
      }

      .userQuestion,
      .chatResponse {
        padding: 0.7em;
        border-radius: 0.3rem;
        border-style: solid;
        border-width: 1px;
        width: 100%;

        :last-child {
          margin-bottom: 0;
        }
      }

      .userQuestion {
        color: #fff;
        background: var(--bs-primary);
        font-weight: 400;
        font-style: italic;
        font-size: 1.2rem;
        margin: 0;
        border-color: var(--bs-primary);
      }

      .chatResponse {
        font-size: 0.9em;
        border-color: var(--bs-primary);
        background: #fff;
      }
    }
  }

  .follow-up-questions {
    margin: 1.2rem 2rem 2rem;
  }
}

.follow-up {
  font-weight: 400;

  background: #d8d2d2;
  color: #000;
  &:focus,
  &:active {
    background: #d8d2d2;
  }

  &:hover {
    background: #ece3e3;
    color: #000;
  }
}

.prompt-label {
  span {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    &.show {
      opacity: 1;
    }
  }
}
</style>
