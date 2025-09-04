import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

export const useGoogleStore = defineStore('google', (config = {}) => {
  const dataLayer = window.flowLayer || null

  /**
   * Records a query in the flow layer.
   *
   * @param {Object} [opts] - Options object
   * @param {string} [opts.query=''] - The query to record
   * @param {boolean} [opts.isPrompt=false] - Whether the query is a prompt
   */
  function recordQuery(opts = {}) {
    if (!dataLayer) return

    const { query = '', isPrompt = false } = opts

    if (query) {
      dataLayer.push({
        event: 'flow-query',
        query: query,
        isPrompt: isPrompt,
        host: window.location.host,
      })

    }
  }

  function tagFlowChat(open = true) {
    if (!dataLayer) return
    dataLayer.push({ event: 'flow-chat-toggle-open', open })
  }

  return {
    recordQuery,
    tagFlowChat
  }
})
