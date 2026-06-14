document.addEventListener('DOMContentLoaded', () => {
  const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

  // Hexo 代码块结构：figure.highlight > table > td.gutter(行号) + td.code > pre
  // 没有 <code> 元素，取 td.code 的文本（自动排除行号），并去掉行号兜底。
  function extractCode(fig) {
    const codeCell = fig.querySelector('.code')
    if (codeCell) return codeCell.innerText.replace(/\n+$/, '')
    const pre = fig.querySelector('pre:last-of-type') || fig.querySelector('pre')
    if (pre) return pre.innerText.replace(/\n+$/, '')
    return fig.innerText.replace(/\n+$/, '')
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }
    // 非安全上下文兜底
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        resolve()
      } catch (e) { reject(e) }
    })
  }

  document.querySelectorAll('figure.highlight').forEach((fig) => {
    const button = document.createElement('div')
    button.className = 'copy-button'
    button.innerHTML = copyIcon
    button.title = '复制代码'

    button.onclick = () => {
      copyText(extractCode(fig)).then(() => {
        button.innerHTML = checkIcon
        button.classList.add('copied')
      }).catch(() => {
        button.innerHTML = copyIcon
      }).finally(() => {
        setTimeout(() => {
          button.innerHTML = copyIcon
          button.classList.remove('copied')
        }, 1500)
      })
    }

    fig.appendChild(button)
  })
})
