customElements.define('tab-panel',
  class extends HTMLElement {
    constructor () {
      super()

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.innerHTML = `<style>${window.liandi.liandi.componentCSS}</style>
<slot name="tab"></slot><slot name="ext"></slot><slot name="panel"></slot>`

      const tabs = Array.from(this.firstElementChild.children).filter(item => {
        return item.getAttribute('data-name')
      })
      const panels = Array.from(this.children).filter(item => {
        return item.getAttribute('data-name')
      })
      
      tabs.forEach(item => {
        item.addEventListener('click', () => {
          tabs.forEach(item => {
            item.classList.remove('tab--current')
          })

          panels.forEach(description => {
            description.removeAttribute('slot')

            if (description.getAttribute('data-name') ===
              item.getAttribute('data-name')) {
              description.setAttribute('slot', 'panel')
              item.classList.add('tab--current')
            }
          })
        })
      })
    }
  },
)
