document.addEventListener('DOMContentLoaded', () => {
  const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

  const codeBlocks = document.querySelectorAll('figure.highlight')

  codeBlocks.forEach((codeBlock) => {
    const button = document.createElement('div')
    button.className = 'copy-button'
    button.innerHTML = copyIcon
    button.title = '复制代码'

    button.onclick = () => {
      try {
        const code = codeBlock.querySelector('code').innerText
        navigator.clipboard.writeText(code)
        button.innerHTML = checkIcon
        button.classList.add('copied')
      } catch {
        button.innerHTML = copyIcon
      } finally {
        setTimeout(() => {
          button.innerHTML = copyIcon
          button.classList.remove('copied')
        }, 1500)
      }
    }

    codeBlock.appendChild(button)
  })
})
