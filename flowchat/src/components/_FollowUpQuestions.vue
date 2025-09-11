<script setup>
import { storeToRefs } from 'pinia'
import { useFlowStore } from '@/stores/flow.js'
const { followUpQuestions } = storeToRefs(useFlowStore())

const toggleSelected = (option, item) => {
  option.selected = !option.selected
  if (item.exclusive && option.selected) {
    item.options.forEach(q => {
      if (q !== option) {
        q.selected = false
      }
    })
  }
}

const emit = defineEmits(['submit:follow-up'])
const submitFollowUp = () => {
  const compiledAnswers = followUpQuestions.value
    .map(item => {
      const selectedOptions = item.options
        .filter(option => option.selected)
        .map(option => option.option)
      if (selectedOptions.length) {
        return `${item.question} : ${selectedOptions.join(', ')}`
      }
      return null
    })
    .filter(Boolean)
    .join('\n')

  if (!compiledAnswers) return

  emit('submit:follow-up', `Follow-up answers:\n${compiledAnswers}`)
}

</script>

<template>
  <div v-if="followUpQuestions.length" class="follow-up-prompt-compiler">
    <div
      v-for="item in followUpQuestions"
      :key="item.question"
    >
      <p>{{ item.question }}</p>
      <div class="button-group">
        <button
          v-for="option in item.options"
          type="button"
          class="follow-up option"
          :class="{ selected: option.selected }"
          @click="toggleSelected(option, item)"
        >
          {{ option.option }}
        </button>
      </div>
    </div>
    <p><button type="button" class="button-secondary" @click="submitFollowUp">Submit</button></p>
  </div>
</template>

<style scoped lang="scss">
.follow-up-prompt-compiler {
  p {
    font-weight: 600;
    font-style: italic;
    margin: 1em 0 .3em;
  }

  button.option {
    &.selected {
      background-color: var(--brand-primary)  !important;
      color: white;
    }
    &:active, &:focus {
      outline: none;
    }
  }

}
</style>
