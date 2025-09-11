<script setup>
import { computed, ref, onUpdated, useId } from 'vue'
import { storeToRefs } from 'pinia'
import slug from 'slug'

import { useGoogleStore } from '@/stores/google.js'
const { recordQuery } = useGoogleStore()

import TranscriptDownload from '@/components/_TranscriptDownload.vue'
import BotResponse from '@/components/_BotResponse.vue'
import PromptButtons from '@/components/_PromptButtons.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

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
  chatExpanded,
  shortlist,
  chatMeta,
} = storeToRefs(flowStore)
const { streamPrediction, resetChat } = flowStore

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
    chatFlow.value.at(-1).chatMeta = chatMeta.value

    // reset stream
    currentStream.value = ''
  }

  const chatItem = {
    question: question.value,
    id: slug(question.value),
    feedback: null,
  }
  chatFlow.value.push(chatItem)

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
</script>
<template>
  <section class="flowChat">
    <div
      :id="wrapperId"
      class="conversation"
    >
      <div id="chat-responses">
        <div
          v-for="(item, index) in chatFlow"
          class="response"
          :id="item.id"
        >
          <div
            v-if="item.question"
            class="chat-item-user"
          >
            <h4 class="userQuestion" v-html="item.question.replace(/\n/g, '<br/>')" />
            <img
              src="https://d1bf5c4zvnlohu.cloudfront.net/assets/user-icon.png"
              alt="User"
              class="avatar"
            />
          </div>

          <BotResponse
            :item="item"
            :is-current="index === chatFlow.length - 1"
            @submit:follow-up="askFlow($event)"
          />
        </div>
      </div>

      <LoadingSpinner
        :is-loading="fetching"
        loading-message="Asking our agents…"
      />

      <PromptButtons
        :prompts="currentFollowUpPrompts"
        @ask-flow="askFlow"
      />
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
      <PromptButtons
        v-if="chatExpanded && showStartupPrompts"
        :prompts="startupPrompts"
        @ask-flow="askFlow"
      />
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
  font-size: 0.9em;

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
