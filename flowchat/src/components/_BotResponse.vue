<script setup>
import markdownit from 'markdown-it'
const md = markdownit()

import { useFlowStore } from '@/stores/flow.js'
import { storeToRefs } from 'pinia'
const flowStore = useFlowStore()
const { sendFeedback } = flowStore
const { compiledFeedbackMessages, currentStreamOutput, readingStream } =
  storeToRefs(flowStore)

import EllipsisBounce from '@/components/_EllipsisBounce.vue'
import ProgressFeedback from '@/components/_ProgressFeedback.vue'
import FollowUpQuestions from '@/components/_FollowUpQuestions.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit:follow-up'])

const giveFeedback = async isPositive => {
  props.item.feedback = isPositive
  await sendFeedback({
    isPositive,
    messageId: props.item?.chatMeta?.chatMessageId || null,
  })
}
</script>

<template>
  <div class="chat-item-bot">
    <img
      src="https://d1bf5c4zvnlohu.cloudfront.net/assets/agar-icon.png"
      alt="Agar"
      class="avatar"
    />
    <div class="chatResponse">
      <ProgressFeedback v-if="isCurrent && compiledFeedbackMessages.length" />

      <div
        v-if="props.item.answer"
        v-html="md.render(props.item.answer)"
      ></div>

      <div
        v-else-if="currentStreamOutput"
        v-html="md.render(currentStreamOutput)"
      />
      <div
        v-else-if="
          isCurrent && readingStream && !compiledFeedbackMessages.length
        "
      >
        <EllipsisBounce />
      </div>

      <FollowUpQuestions
        v-if="isCurrent && !readingStream"
        @submit:follow-up="emit('submit:follow-up', $event)"
      />
    </div>
  </div>

  <div
    v-if="props.item.answer && props.item.question"
    class="feedback"
  >
    <span
      class="thumbs-up-icon"
      :class="{ submitted: props.item.feedback === true }"
      title="Helpful"
      @click="giveFeedback(true)"
    ></span>
    <span
      class="thumbs-down-icon"
      :class="{ submitted: props.item.feedback === false }"
      title="Not helpful"
      @click="giveFeedback(false)"
    ></span>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/scss/mixins';

.chatResponse {
  > div {
    @include mixins.null-y-margins;
  }
}

.feedback {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin: 0.5rem;
  span {
    --icon-colour: #000;
    --icon-size: 1.5rem;

    &:hover {
      cursor: pointer;

      &.thumbs-up-icon {
        --icon-colour: var(--brand-success);
      }
      &.thumbs-down-icon {
        --icon-colour: var(--brand-danger);
      }
    }

    &.submitted {
      &.thumbs-up-icon {
        --icon-colour: var(--brand-success);
      }
      &.thumbs-down-icon {
        --icon-colour: var(--brand-danger);
      }
    }
  }
}
</style>
