customElements.define('file-item',
  class extends HTMLElement {

    static get observedAttributes () {
      return ['name']
    }

    constructor () {
      super()

      let pathHTML = '<path d="M29.693 25.847h-27.386c-1.274 0-2.307-1.033-2.307-2.307v0-15.081c0-1.274 1.033-2.307 2.307-2.307h27.386c1.274 0 2.307 1.033 2.307 2.307v15.079c0 0.001 0 0.002 0 0.003 0 1.274-1.033 2.307-2.307 2.307 0 0 0 0 0 0v0zM7.691 21.231v-6l3.078 3.847 3.076-3.847v6.001h3.078v-10.461h-3.078l-3.076 3.847-3.078-3.847h-3.078v10.464zM28.309 16h-3.078v-5.231h-3.076v5.231h-3.078l4.615 5.386z"></path>'
      if (this.parentElement.classList.contains('files__back')) {
        pathHTML = '<path d="M27.508 10.777c-0.25 0.523-0.751 0.842-1.319 0.842h-4.367v19.654c0 0.409-0.318 0.728-0.728 0.728h-16.014c-0.273 0-0.546-0.159-0.66-0.409-0.114-0.273-0.091-0.569 0.091-0.796l3.64-4.367c0.136-0.159 0.364-0.25 0.569-0.25h7.279v-14.558h-4.367c-0.569 0-1.069-0.318-1.319-0.842-0.227-0.5-0.159-1.115 0.205-1.547l7.279-8.735c0.546-0.66 1.683-0.66 2.229 0l7.279 8.735c0.364 0.432 0.455 1.046 0.205 1.547z"></path>'
      } else if (decodeURIComponent(this.getAttribute('path')).endsWith('/')) {
        pathHTML = '<path d="M32 11.692v13.538c0 2.365-1.942 4.308-4.308 4.308h-23.385c-2.365 0-4.308-1.942-4.308-4.308v-18.462c0-2.365 1.942-4.308 4.308-4.308h6.154c2.365 0 4.308 1.942 4.308 4.308v0.615h12.923c2.365 0 4.308 1.942 4.308 4.308z"></path>'
      }
      const divElement = document.createElement('div')
      divElement.className = 'list__item file-item'
      if (this.getAttribute('current') === 'true') {
        divElement.classList.add('list__item--current')
      }
      divElement.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${pathHTML}</svg>
<span>${decodeURIComponent(this.getAttribute('name')).
        replace(/&/g, '&amp;').
        replace(/</g, '&lt;')}</span>`

      const that = this
      divElement.addEventListener('click', async function () {
        if (this.classList.contains('list__item--current')) {
          return
        }

        const path = decodeURIComponent(that.getAttribute('path'))
        const url = window.liandi.liandi.current.dir.url

        window.liandi.liandi.files.listElement.querySelectorAll('file-item').
          forEach((item) => {
            item.shadowRoot.querySelector('.list__item').
              classList.
              remove('list__item--current')
            item.setAttribute('current', 'false')
          })

        this.classList.add('list__item--current')
        that.setAttribute('current', 'true')

        if (path.endsWith('/')) {
          // 同步导航目录
          const treeListElement = window.liandi.liandi.navigation.element.querySelector(
            `tree-list[url="${window.liandi.liandi.current.dir.url}"]`).shadowRoot
          const treeCurrentElement = treeListElement.querySelector(
            '.list__item--current')
          if (treeCurrentElement) {
            treeCurrentElement.classList.remove('list__item--current')
          }
          const treePathElement = treeListElement.querySelector(
            `.tree-list__folder[path="${path}"]`)
          if (treePathElement) {
            treePathElement.parentElement.classList.add('list__item--current')
          }

          window.liandi.liandi.editors.close(window.liandi.liandi)
          window.liandi.liandi.ws.send('ls', {
            url,
            path,
          })
        } else {
          document.querySelector('.loading').style.display = "flex"
          await new Promise(resolve => setTimeout(resolve, 800))
          document.querySelector('.loading').style.display = "none"
          window.liandi.liandi.editors.save(window.liandi.liandi)
          window.liandi.liandi.ws.send('get', {
            url,
            path,
          })
        }

        window.liandi.liandi.current.path = path
      })

      const styleElement = document.createElement('style')
      styleElement.innerText = window.liandi.liandi.componentCSS

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(styleElement)
      shadowRoot.appendChild(divElement)
    }

    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'name' && oldValue) {
        this.shadowRoot.querySelector(
          'div span').innerHTML = decodeURIComponent(newValue).
          replace(/&/g, '&amp;').
          replace(/</g, '&lt;')
      }
    }
  },
)
