import { getName } from '../util/path'

customElements.define('tree-list',
  class extends HTMLElement {
    constructor () {
      super()

      const dir = JSON.parse(decodeURIComponent(this.getAttribute('dir')))
      const remote = dir.path === '' ? 'true' : 'false'

      let pathHTML = '<path d="M32 21.333c0 3.533-2.867 6.4-6.4 6.4h-18.133c-4.117 0-7.467-3.35-7.467-7.467 0-2.983 1.767-5.567 4.3-6.75-0.017-0.233-0.033-0.483-0.033-0.717 0-4.717 3.817-8.533 8.533-8.533 3.567 0 6.617 2.183 7.9 5.3 0.733-0.65 1.7-1.033 2.767-1.033 2.35 0 4.267 1.917 4.267 4.267 0 0.85-0.25 1.633-0.683 2.3 2.833 0.667 4.95 3.2 4.95 6.233z"></path>'
      if (remote === 'false') {
        pathHTML = '<path d="M32 11.692v13.538c0 2.365-1.942 4.308-4.308 4.308h-23.385c-2.365 0-4.308-1.942-4.308-4.308v-18.462c0-2.365 1.942-4.308 4.308-4.308h6.154c2.365 0 4.308 1.942 4.308 4.308v0.615h12.923c2.365 0 4.308 1.942 4.308 4.308z"></path>'
      }
      const ulElement = document.createElement('ul')
      ulElement.className = 'tree-list'
      ulElement.innerHTML = `<li class="list__item fn__flex">
<svg class="fn__flex-shrink0 tree-list__arrow" path="/" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="tree-list__folder fn__ellipsis" path="/">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${pathHTML}</svg>
  <span>${getName(dir.url)}</span>
</span>
</li>`

      window.liandi.liandi.ws.send('lsd', {
        url: dir.url,
        path: '/',
      }, true)

      const getLeaf = (target) => {
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
          fileHTML += `<li class="list__item fn__flex${item.path ===
          window.liandi.liandi.current.path
            ? ' list__item--current'
            : ''}" style="padding-left: ${(item.path.split(
            '/').length - 2) * 13}px">
<svg class="fn__flex-shrink0 tree-list__arrow" path="${item.path}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="tree-list__folder fn__ellipsis" path="${item.path}">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${pathHTML}</svg>
  <span>${item.name}</span>
</span>
</li>`
          window.liandi.liandi.ws.send('lsd', {
            url: dir.url,
            path: item.path,
          }, true)
        })
        target.parentElement.insertAdjacentHTML('afterend',
          `<ul>${fileHTML}</ul>`)
      }

      let timeoutId
      ulElement.addEventListener('click', (event) => {
        let target = event.target
        if (event.detail === 1) {
          timeoutId = setTimeout(() => {
            while (target && !target.parentElement.isEqualNode(ulElement)) {
              if (target.classList.contains('tree-list__folder')) {
                if (target.parentElement.classList.contains(
                  'list__item--current')) {
                  return
                }

                window.liandi.liandi.navigation.element.querySelectorAll(
                  'tree-list').forEach(item => {
                  item.shadowRoot.querySelectorAll('li').forEach((liItem) => {
                    liItem.classList.remove('list__item--current')
                  })
                })

                target.parentElement.classList.add('list__item--current')
                window.liandi.liandi.editors.close(window.liandi.liandi)

                window.liandi.liandi.ws.send('ls', {
                  url: dir.url,
                  path: target.getAttribute('path'),
                })

                window.liandi.liandi.current = {
                  dir,
                  path: target.getAttribute('path'),
                }
                event.preventDefault()
                event.stopPropagation()
                break
              }

              if (target.classList.contains('tree-list__arrow')) {
                getLeaf(target)
                event.preventDefault()
                event.stopPropagation()
                break
              }

              target = target.parentElement
            }
          }, 300)
        } else if (event.detail === 2) {
          while (target && !target.isEqualNode(ulElement)) {
            if (target.classList.contains('list__item')) {
              getLeaf(target.querySelector('.tree-list__arrow'))
              event.preventDefault()
              event.stopPropagation()
            }

            target = target.parentElement
          }
          clearTimeout(timeoutId)
        }
      })

      const styleElement = document.createElement('style')
      styleElement.innerText = window.liandi.liandi.componentCSS

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(styleElement)
      shadowRoot.appendChild(ulElement)
    }
  })
