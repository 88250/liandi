customElements.define('file-item',
  class extends HTMLElement {

    static get observedAttributes () {
      return ['name']
    }

    constructor () {
      super()

      let pathHTML = '<path d="M25.982 22.617h-23.963c-1.115 0-2.018-0.904-2.018-2.018v0-13.196c0-1.115 0.904-2.018 2.018-2.018h23.963c1.115 0 2.018 0.904 2.018 2.018v13.194c0 0.001 0 0.002 0 0.002 0 1.115-0.904 2.018-2.018 2.018 0 0 0 0 0 0v0zM6.73 18.577v-5.25l2.693 3.366 2.692-3.366v5.25h2.693v-9.153h-2.693l-2.692 3.366-2.693-3.366h-2.693v9.156zM24.77 14h-2.693v-4.577h-2.692v4.577h-2.693l4.038 4.713z"></path>'
      if (this.parentElement.classList.contains('files__back')) {
        pathHTML = '<path d="M9.43 3.93c0.458 0.219 0.736 0.657 0.736 1.154v3.822h17.197c0.358 0 0.637 0.279 0.637 0.637v14.012c0 0.239-0.139 0.478-0.358 0.577-0.239 0.1-0.498 0.080-0.697-0.080l-3.822-3.185c-0.139-0.119-0.219-0.318-0.219-0.498v-6.369h-12.739v3.822c0 0.498-0.279 0.935-0.736 1.154-0.438 0.199-0.975 0.139-1.353-0.179l-7.643-6.369c-0.577-0.478-0.577-1.473 0-1.951l7.643-6.369c0.378-0.318 0.916-0.398 1.353-0.179z"></path>'
      } else if (this.getAttribute('path').endsWith('/')) {
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
<span>${this.getAttribute('name')}</span>`

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
          window.liandi.liandi.editors.remove(window.liandi.liandi)
          window.liandi.liandi.ws.send('ls', {
            url,
            path,
          })
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

    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'name' && oldValue) {
        this.shadowRoot.querySelector('div span').innerHTML = newValue
      }
    }
  },
)
