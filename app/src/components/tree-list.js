import { getName } from '../util/path'

customElements.define('tree-list',
  class extends HTMLElement {
    constructor () {
      super()

      const remote = this.getAttribute('remote')
      const url = this.getAttribute('url')

      let pathHTML = '<path d="M28 18.667c0 3.092-2.508 5.6-5.6 5.6h-15.867c-3.602 0-6.533-2.931-6.533-6.533 0-2.61 1.546-4.871 3.762-5.906-0.015-0.204-0.029-0.423-0.029-0.627 0-4.127 3.34-7.467 7.467-7.467 3.121 0 5.79 1.91 6.913 4.637 0.642-0.569 1.487-0.904 2.421-0.904 2.056 0 3.733 1.677 3.733 3.733 0 0.744-0.219 1.429-0.598 2.013 2.479 0.583 4.331 2.8 4.331 5.454z"></path>'
      if (remote === 'false') {
        pathHTML = '<path d="M28 10.231v11.846c0 2.070-1.7 3.769-3.769 3.769h-20.462c-2.070 0-3.769-1.7-3.769-3.769v-16.154c0-2.070 1.7-3.769 3.769-3.769h5.385c2.070 0 3.769 1.7 3.769 3.769v0.538h11.308c2.070 0 3.769 1.7 3.769 3.769z"></path>'
      }
      const ulElement = document.createElement('ul')
      ulElement.className = 'tree-list'
      ulElement.innerHTML = `<li class="list__item fn__flex">
<svg class="fn__flex-shrink0 tree-list__arrow" path="/" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"></svg>
<span class="tree-list__folder fn__ellipsis" path="/">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
  <span>${getName(url)}</span>
</span>
</li>`

      window.liandi.liandi.ws.send('lsd', {
        url,
        path: '/',
      }, true)

      ulElement.addEventListener('click',  (event) => {
        let target = event.target
        while (target && !target.parentElement.isEqualNode(ulElement)) {
          if (target.classList.contains('tree-list__folder')) {
            if (target.parentElement.classList.contains('list__item--current')) {
              return
            }

            window.liandi.liandi.navigation.element.querySelectorAll('tree-list').forEach(item => {
              item.shadowRoot.querySelectorAll('li').forEach((liItem) => {
                liItem.classList.remove('list__item--current')
              })
            })

            target.parentElement.classList.add('list__item--current')
            window.liandi.liandi.editors.remove(window.liandi.liandi)
            window.liandi.liandi.ws.send('ls', {
              url,
              path: target.getAttribute('path'),
            })
            event.preventDefault()
            break
          }

          if (target.classList.contains('tree-list__arrow')) {
            const filesString = target.getAttribute('files')
            if (!filesString) {
              return
            }
            if (target.classList.contains('tree-list__arrow--open')) {
              target.classList.remove('tree-list__arrow--open')
              target.parentElement.nextElementSibling.style.display = 'none'
              return
            }

            target.classList.add('tree-list__arrow--open')

            const files = JSON.parse(filesString)
            let fileHTML = ''
            files.forEach((item) => {
              fileHTML += `<li class="list__item fn__flex" style="padding-left: ${(item.path.split('/').length - 2) * 13}px">
<svg class="fn__flex-shrink0 tree-list__arrow" path="${item.path}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"></svg>
<span class="tree-list__folder fn__ellipsis" path="${item.path}">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
  <span>${item.name}</span>
</span>
</li>`
              window.liandi.liandi.ws.send('lsd', {
                url,
                path: item.path,
              }, true)
            })
            target.parentElement.insertAdjacentHTML('afterend', `<ul>${fileHTML}</ul>`)
            event.preventDefault()
            break
          }

          target = target.parentElement
        }
      }, false)

      const styleElement = document.createElement('style')
      styleElement.innerText = window.liandi.liandi.componentCSS;

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(styleElement)
      shadowRoot.appendChild(ulElement)
    }
  })
