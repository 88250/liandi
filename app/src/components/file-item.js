customElements.define('file-item',
  class extends HTMLElement {

    static get observedAttributes () {
      return ['name']
    }

    constructor () {
      super()

      let pathHTML = '<path d="M25.982 22.617h-23.963c-1.115 0-2.018-0.904-2.018-2.018v0-13.196c0-1.115 0.904-2.018 2.018-2.018h23.963c1.115 0 2.018 0.904 2.018 2.018v13.194c0 0.001 0 0.002 0 0.002 0 1.115-0.904 2.018-2.018 2.018 0 0 0 0 0 0v0zM6.73 18.577v-5.25l2.693 3.366 2.692-3.366v5.25h2.693v-9.153h-2.693l-2.692 3.366-2.693-3.366h-2.693v9.156zM24.77 14h-2.693v-4.577h-2.692v4.577h-2.693l4.038 4.713z"></path>'
      if (this.parentElement.classList.contains('files__back')) {
        pathHTML = '<path d="M24.070 9.43c-0.219 0.458-0.657 0.736-1.154 0.736h-3.822v17.197c0 0.358-0.279 0.637-0.637 0.637h-14.012c-0.239 0-0.478-0.139-0.577-0.358-0.1-0.239-0.080-0.498 0.080-0.697l3.185-3.822c0.119-0.139 0.318-0.219 0.498-0.219h6.369v-12.739h-3.822c-0.498 0-0.935-0.279-1.154-0.736-0.199-0.438-0.139-0.975 0.179-1.353l6.369-7.643c0.478-0.577 1.473-0.577 1.951 0l6.369 7.643c0.318 0.378 0.398 0.916 0.179 1.353z"></path>'
      } else if (this.getAttribute('path').endsWith('/')) {
        pathHTML = '<path d="M28 10.231v11.846c0 2.070-1.7 3.769-3.769 3.769h-20.462c-2.070 0-3.769-1.7-3.769-3.769v-16.154c0-2.070 1.7-3.769 3.769-3.769h5.385c2.070 0 3.769 1.7 3.769 3.769v0.538h11.308c2.070 0 3.769 1.7 3.769 3.769z"></path>'
      }
      const divElement = document.createElement('div')
      divElement.className = 'list__item file-item'
      if (this.getAttribute('current') === 'true') {
        divElement.classList.add('list__item--current')
      }
      divElement.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
<span>${this.getAttribute('name')}</span>`

      const that = this
      divElement.addEventListener('click', function () {
        if (this.classList.contains('list__item--current')) {
          return
        }

        const path = that.getAttribute('path')
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

          window.liandi.liandi.editors.remove(window.liandi.liandi)
          window.liandi.liandi.ws.send('ls', {
            url,
            path,
          })
        } else {
          window.liandi.liandi.editors.saveContent(window.liandi.liandi)
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
        this.shadowRoot.querySelector('div span').innerHTML = newValue
      }
    }
  },
)
