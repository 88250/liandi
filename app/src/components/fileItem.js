customElements.define('file-item',
  class extends HTMLElement {

    static get observedAttributes() {
      return ['name'];
    }

    constructor () {
      super()

      const divElement = document.createElement('div')
      divElement.textContent = this.getAttribute('name')
      divElement.addEventListener('click', () => {
        const url = this.getAttribute('url')
        const path = this.getAttribute('path')
        const dir = this.getAttribute('dir')

        if (this.classList.contains('current')) {
          return
        }
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

          window.liandi.liandi.editors.remove(window.liandi.liandi)
          window.liandi.liandi.files.renderBack(url, path)
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

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "name" && oldValue) {
        this.shadowRoot.querySelector('div').textContent = newValue
      }
    }
  },
)
