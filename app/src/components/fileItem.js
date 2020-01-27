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
        if (dir === "true") {
          window.liandi.liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'ls',
            param: {
              url,
              path,
            },
          }))
        } else {
          window.liandi.liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'get',
            param: {
              url,
              path,
            },
          }))
        }
      })

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(divElement)
    }
  },
)
