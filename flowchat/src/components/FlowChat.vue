<script setup>
import { computed, ref, onUpdated, useId } from 'vue'
import { storeToRefs } from 'pinia'
import slug from 'slug'

import { useGoogleStore } from '@/stores/google.js'
const { recordQuery } = useGoogleStore()

import TranscriptDownload from '@/components/_TranscriptDownload.vue'
import ProgressFeedback from '@/components/_ProgressFeedback.vue'
import EllipsisBounce from '@/components/_EllipsisBounce.vue'

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
  compiledFeedbackMessages,
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

  recordQuery({ query: question.value, isPrompt })

  // reset suggestions if not prompt as the query may relate to a different product
  if (!isPrompt) {
    shortlist.value = []
  }

  /*agentUserMessage*/
  // append current stream to chatFlow
  if (chatFlow.value.length) {
    chatFlow.value.at(-1).answer = currentStreamOutput.value.toString()
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

const transcript = computed(() => {
  const fullFlow = [...chatFlow.value]
  fullFlow.at(-1).answer = currentStreamOutput.value

  const compiledTranscript = fullFlow.reduce((acc, item) => {
    if (item?.question) {
      acc.push(`### ${item.question}`)
    }
    if (item?.answer) {
      acc.push(`${item.answer}`)
    }
    return acc
  }, [])

  return JSON.stringify(compiledTranscript.join('\n\n'))
})

const renderedFeedback = computed(() => {})

const ellipsis =
  '<span class="ellipsis"><span>.</span><span>.</span><span>.</span></span>'
</script>
<template>
  <section class="flowChat">
    <div
      :id="wrapperId"
      class="conversation"
    >
      <div id="chat-responses">
        <div
          v-for="item in chatFlow"
          class="response"
          :id="item.id"
        >
          <div
            v-if="item.question"
            class="chat-item-user"
          >
            <h4 class="userQuestion">{{ item.question }}</h4>
            <img
              src="https://d1bf5c4zvnlohu.cloudfront.net/assets/user-icon.png"
              alt="User"
              class="avatar"
            />
          </div>
          <div class="chat-item-bot">
            <img
              src="https://d1bf5c4zvnlohu.cloudfront.net/assets/agar-icon.png"
              alt="Agar"
              class="avatar"
            />
            <div
              v-if="item?.answer"
              v-html="md.render(item.answer)"
              class="chatResponse"
            />
            <div
              v-else-if="compiledFeedbackMessages.length"
              class="chatResponse"
            >
              <ProgressFeedback />
            </div>
            <div
              v-else-if="currentStreamOutput"
              v-html="md.render(currentStreamOutput)"
              class="chatResponse"
            />
            <div
              v-else-if="readingStream"
              class="chatResponse"
            >
              <EllipsisBounce />
            </div>
          </div>
        </div>
      </div>

      <LoadingSpinner
        :is-loading="fetching"
        loading-message="Asking our agents…"
      />

      <div
        v-if="currentFollowUpPrompts.length"
        class="follow-up-questions"
      >
        <button
          v-for="prompt in currentFollowUpPrompts"
          type="button"
          class="follow-up prompt"
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
      <div class="chat-input">
        <input
          :id="labelId"
          v-model="flowQuery"
          name="flowQuery"
          class="form-control"
          placeholder="Ask me a question about our products and services…"
        />

        <button
          type="submit"
          class="button-primary"
          @click.prevent="askFlow"
        >
          {{ submitLabel }}
          <i
            v-if="!submitLabel"
            class="fa-solid fa-arrow-right"
          />
        </button>

        <button
          v-if="chatFlow.length > 1"
          type="button"
          class="follow-up"
          @click="reset"
        >
          Reset Chat
        </button>
      </div>
    </form>

    <Transition appear>
      <div
        v-if="chatExpanded && showStartupPrompts"
        class="follow-up-questions"
      >
        <button
          v-for="prompt in startupPrompts"
          type="button"
          class="follow-up prompt"
          @click="askFlow(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </Transition>

    <TranscriptDownload
      v-if="chatExpanded"
      :transcript
    />

    <!--    <pre class="text-break">{{ transcript }}</pre>-->
  </section>
</template>

<style lang="scss">
.conversation,
.suggestions {
  overflow-y: auto;
  //margin-bottom: 1.2rem;
  border-radius: 0.4rem;
}

.flowChat {
  display: flex;
  flex-direction: column;
}

.conversation {
  background-color: var(--brand-light);
  position: relative;
  flex-grow: 1;
  box-shadow: 0.1rem 0.1rem 0.6rem rgba(var(--brand-primary), 0.5) inset;
  transition: height 0.3s ease-in-out;
  padding: 1rem 0;

  #chat-responses {
    background: transparent;

    .chat-item-user,
    .chat-item-bot {
      display: flex;
      gap: 1rem;
    }

    .chat-item-user {
      justify-content: flex-end;
      margin: 1.2rem 0 1rem;
    }

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

        > :first-child {
          margin-top: 0;
        }

        > :last-child {
          margin-bottom: 0;
        }
      }

      .userQuestion {
        color: #fff;
        background: var(--brand-primary);
        font-weight: 400;
        font-style: italic;
        font-size: 1.2rem;
        margin: 0;
        border-color: var(--brand-primary);
      }

      .chatResponse {
        font-size: 0.9em;
        border-color: var(--brand-primary);
        background: #fff;
        width: 100%;
      }
    }
  }

  .follow-up-questions {
    margin: 1rem;
  }
}

.chat-input {
  display: flex;
  gap: 0.4rem;
  margin: 1rem 0 0.6rem;
}

.follow-up-questions {
  margin: 0.5rem 0;
  display: flex;
  gap: 0.5rem;
  justify-content: stretch;
}

.follow-up {
  font-weight: 400;
  font-size: .9em;

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
