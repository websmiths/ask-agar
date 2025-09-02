;(function () {
  function insertScriptAndCss(scriptUrl, cssUrl) {
    // Create and append CSS link
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssUrl
    document.head.appendChild(link)

    // Create and append JS module script
    const script = document.createElement('script')
    script.type = 'module'
    script.src = scriptUrl
    document.head.appendChild(script)
  }

  insertScriptAndCss(
    'https://d1bf5c4zvnlohu.cloudfront.net/flowchat.js',
    'https://d1bf5c4zvnlohu.cloudfront.net/flowchat-index.css',
  )
})()

