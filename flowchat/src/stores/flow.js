import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import { FlowiseClient } from 'flowise-sdk'

import markdownit from 'markdown-it'
const md = markdownit()

export const useFlowStore = defineStore('flow', (config = {}) => {
  const {
    baseUrl = 'https://flowise-agar.3dn.com.au/api/v1/',
    chatId = 'ask-agar-claude',
    // chatId = 'j-event-control',
    initialGreeting = 'Hi there! I’m Agar, your AI assistant for Agar Cleaning Systems. How can I help you today?',
  } = config

  // basic fetch setup for post
  const basePayload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const chatExpanded = shallowRef(false)

  const currentChatId = shallowRef(chatId)
  const agentFlows = new Map([
    ['ask-agar-claude', '6f41c314-30ab-42e5-ae30-9275cef195d4'],
    ['ask-agar-claude-j', '9a151d62-5dae-4cfd-a8b7-7f903b7a4294'],
    ['j-event-control', '78ff1622-b4ce-4ece-a76f-a653a7bd7be0'],
  ])

  const flowId = computed(() => agentFlows.get(currentChatId.value))
  const sessionId = shallowRef(null)

  // User's current question
  const question = ref('')

  // Flowise client from SDK can read streams
  const flowClient = new FlowiseClient({
    baseUrl: 'https://flowise-agar.3dn.com.au',
  })

  const readingStream = shallowRef(false)
  const currentStream = ref(initialGreeting)
  const currentStreamOutput = computed(() => currentStream.value.split('<CONCLUSION>').pop())
  const currentFollowUpPrompts = ref([])
  const flowState = ref({})

  const shortlist = shallowRef([])
  const filteredShortlist = computed(() => {
    // return shortlist.value
    if (!recommendation.value?.name) return shortlist.value
    return shortlist.value.filter(item => {
      return item && item.name !== recommendation.value.name
    })
  })
  const recommendation = shallowRef({})

  function resetChat() {
    currentStream.value = initialGreeting
    currentFollowUpPrompts.value = []
    shortlist.value = []
    recommendation.value = {}
    flowState.value = {}
    readingStream.value = false
  }

  async function streamPrediction() {
    readingStream.value = true

    let resetFlow = false

    try {
      // For streaming prediction
      const predictionStream = await flowClient.createPrediction({
        chatflowId: flowId.value,
        question: question.value,
        streaming: true,
      })

      for await (const chunk of predictionStream) {
        // console.log('Raw chunk: ', chunk)

        // {event: "token", data: "hello"}
        if (chunk.event === 'end') {
          console.log('end')
          readingStream.value = false
          return
        }

        const myChunk = parseChunk(chunk)
        console.log('Parsed chunk: ', myChunk)

        if (myChunk.type === 'token' && chunk.data) {
      /*    if (myChunk.data.includes('<CONCLUSION>')) {
            resetFlow = false
            continue
          }
*/
          if (resetFlow) {
            currentStream.value = chunk.data
            resetFlow = false
          } else {
            currentStream.value += chunk.data
          }
        }

        if (myChunk.data?.followUpPrompts) {
          console.log('followUpPrompts', myChunk.data.followUpPrompts)
          currentFollowUpPrompts.value = JSON.parse(
            myChunk.data.followUpPrompts,
          )
        }

        if (myChunk.data.resetFlow) {
          resetFlow = true
        }

        if (myChunk.data.isShortlist && myChunk.data.args) {
          shortlist.value.push(myChunk.data.args)
        }

        if (myChunk.data.isRecommendation) {
          recommendation.value = myChunk.data.args || null
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      readingStream.value = false
    }
  }

  const resetTools = ['agar_meta_data', 'agar_product_data_sheets']
  function parseChunk(chunk) {
    const myChunk = {
      type: chunk.event,
    }

    if (Array.isArray(chunk.data)) {
      myChunk.data = chunk.data
    } else if (typeof chunk.data === 'string') {
      try {
        myChunk.data = JSON.parse(chunk.data)
      } catch (e) {
        myChunk.data = chunk.data
      }
    } else {
      myChunk.data = chunk.data
    }

    // get state if
    if (chunk.event === 'agentFlowExecutedData' && chunk.data?.length) {
      flowState.value = chunk.data.pop().data.state
    }

    if (Array.isArray(myChunk.data)) {
      myChunk.data = myChunk.data.map(item => {
        const theItem = {
          ...item,
          toolName: item?.name || null,
          resetFlow: item?.name ? resetTools.includes(item.name) : false,
        }

        if (theItem.toolName === 'product_recommendation') {
          theItem.isRecommendation = item.args.isRecommendation
          theItem.isShortlist = item.args.isShortlist
        }

        return theItem
      })

      if (myChunk.data.length === 1) {
        myChunk.data = myChunk.data[0]
        myChunk.toolName = myChunk.data?.name || myChunk.data?.tool || null
        myChunk.isRecommendation = myChunk.data.isRecommendation || null
        myChunk.isShortlist = myChunk.data.isShortlist || null
        myChunk.resetFlow = myChunk.data?.resetFlow
      }
    }

    // console.log('bfa: ', { chunk, myChunk })

    return myChunk
  }

  const overrideConfig = ref({})

  const fetching = shallowRef(null)

  // compile payload for prediction endpoint
  const predictionPayload = computed(() => {
    if (sessionId.value) {
      overrideConfig.value.sessionId = sessionId.value
    }

    const body = {
      question: question.value,
      overrideConfig: overrideConfig.value,
    }

    if (overrideConfig.value) {
      body.overrideConfig = overrideConfig.value
    }

    return {
      ...basePayload,
      body: JSON.stringify(body),
    }
  })

  /**
   * Run query
   * @return {Promise<any>}
   */
  const queryFlow = async () => {
    console.log('queryFlow: ', flowId.value, currentChatId.value)

    const fetchUrl = `${baseUrl}prediction/${flowId.value}`

    fetching.value = true
    const response = await fetch(fetchUrl, predictionPayload.value)
    fetching.value = false

    const result = await response.json()

    if (result.sessionId && !sessionId.value) {
      sessionId.value = result.sessionId
    }

    return result
  }

  /**
   * Lead generation
   * @param config
   * @param config.email
   * @param [config.name]
   * @param [config.phone]
   * @return {Promise<void>}
   */
  const createLead = async config => {
    const { email, name = '', phone = '' } = config

    const leadPayload = {
      // id: "cfd531e0-82fc-11e9-bc42-526af7764f64",
      email,
      name,
      phone,
      chatflowid: flowId.value,
      chatId: sessionId.value,
      createdDate: new Date().toISOString(),
    }

    await fetch(`${baseUrl}leads`, {
      ...basePayload,
      body: JSON.stringify(leadPayload),
    })
  }

  return {
    queryFlow,
    createLead,
    streamPrediction,
    resetChat,
    currentStream,
    currentStreamOutput,
    shortlist,
    filteredShortlist,
    recommendation,
    currentFollowUpPrompts,
    flowState,
    currentChatId,
    question,
    overrideConfig,
    fetching,
    readingStream,
    chatExpanded,
  }
})
