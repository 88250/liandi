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
        if (this.classList.contains('current')) {
          return
        }

        const path = this.getAttribute('path')
        const url = window.liandi.liandi.current.url

        this.parentElement.querySelectorAll('file-item').forEach((item) => {
          item.classList.remove('current')
        })

        this.classList.add('current')
        if (path.endsWith('/')) {
          window.liandi.liandi.ws.send('ls',  {
              url,
              path,
            })

          window.liandi.liandi.editors.remove(window.liandi.liandi)
          window.liandi.liandi.files.renderBack(url, path)
        } else {
          window.liandi.liandi.ws.send('get', {
              url,
              path,
            })
        }

        window.liandi.liandi.current.path = path
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
