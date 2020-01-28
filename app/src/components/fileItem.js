customElements.define('file-item',
  class extends HTMLElement {
    constructor () {
      super()

      const divElement = document.createElement('div')
      divElement.textContent = this.getAttribute('name')

      const url = this.getAttribute('url')
      const path = this.getAttribute('path')
      const dir = this.getAttribute('dir')
      divElement.addEventListener('click', () => {
        if (!url) {
          return
        }
        this.parentElement.querySelectorAll('file-item').forEach((item) => {
          item.classList.remove('current')
        })
        this.className = 'current'
        if (dir === 'true') {
          window.liandi.liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'ls',
            param: {
              url,
              path,
            },
          }))

          window.liandi.liandi.editors.remove()

          if (path === '/') {
            window.liandi.liandi.files.element.firstElementChild.innerHTML = ''
          } else {
            const lastPaths = path.substr(0, path.lastIndexOf('/')).
              lastIndexOf('/') + 1
            window.liandi.liandi.files.element.firstElementChild.innerHTML =
              `<file-item dir="true" name="返回上一层" url="${url}" path="${path.substring(
                0, lastPaths)}"></file-item>`
          }
        } else {
          window.liandi.liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'get',
            param: {
              url,
              path,
            },
          }))
          window.liandi.liandi.editors.url = url
          window.liandi.liandi.editors.path = path
        }
      })

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(divElement)
    }
  },
)
