import { getName } from '../util/path'

customElements.define('tree-item',
  class extends HTMLElement {
    constructor () {
      super()

      const remote = this.getAttribute('remote')
      const url = this.getAttribute('url')

      let pathHTML = '<path d="M28 18.667c0 3.092-2.508 5.6-5.6 5.6h-15.867c-3.602 0-6.533-2.931-6.533-6.533 0-2.61 1.546-4.871 3.762-5.906-0.015-0.204-0.029-0.423-0.029-0.627 0-4.127 3.34-7.467 7.467-7.467 3.121 0 5.79 1.91 6.913 4.637 0.642-0.569 1.487-0.904 2.421-0.904 2.056 0 3.733 1.677 3.733 3.733 0 0.744-0.219 1.429-0.598 2.013 2.479 0.583 4.331 2.8 4.331 5.454z"></path>'
      if (remote === 'false') {
        pathHTML = '<path d="M28 10.231v11.846c0 2.070-1.7 3.769-3.769 3.769h-20.462c-2.070 0-3.769-1.7-3.769-3.769v-16.154c0-2.070 1.7-3.769 3.769-3.769h5.385c2.070 0 3.769 1.7 3.769 3.769v0.538h11.308c2.070 0 3.769 1.7 3.769 3.769z"></path>'
      }
      const divElement = document.createElement('div')
      divElement.innerHTML = `<style>
svg {
    height: 14px;
    width: 14px;
    float: left;
    margin: 2px 5px 0 0;
    fill: currentColor;
    color: rgba(0, 0, 0, .54);
}
</style><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
${getName(url)}`

      divElement.addEventListener('click', () => {
        if (this.classList.contains('current')) {
          return
        }

        this.parentElement.querySelectorAll('tree-item').forEach((item) => {
          item.classList.remove('current')
        })
        this.classList.add('current')
        const url = this.getAttribute('url')

        window.liandi.liandi.ws.send('ls', {
          url,
          path: '/',
        })
        window.liandi.liandi.editors.remove(window.liandi.liandi)
        window.liandi.liandi.files.renderBack(url, '/')
        window.liandi.liandi.current.url = url
      })

      const shadowRoot = this.attachShadow({mode: 'closed'})
      shadowRoot.appendChild(divElement)
    }
  })
