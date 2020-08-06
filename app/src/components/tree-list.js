customElements.define('tree-list',
  class extends HTMLElement {
    constructor () {
      super()

      const dir = JSON.parse(decodeURIComponent(this.getAttribute('dir')))
      let pathHTML = '<path d="M32 21.333c0 3.533-2.867 6.4-6.4 6.4h-18.133c-4.117 0-7.467-3.35-7.467-7.467 0-2.983 1.767-5.567 4.3-6.75-0.017-0.233-0.033-0.483-0.033-0.717 0-4.717 3.817-8.533 8.533-8.533 3.567 0 6.617 2.183 7.9 5.3 0.733-0.65 1.7-1.033 2.767-1.033 2.35 0 4.267 1.917 4.267 4.267 0 0.85-0.25 1.633-0.683 2.3 2.833 0.667 4.95 3.2 4.95 6.233z"></path>'
      if (dir.path !== '') {
        // web dva
        pathHTML = '<path d="M12.77 3.155l3.23 3.23h12.845q1.277 0 2.216 0.977t0.939 2.254v16q0 1.277-0.939 2.254t-2.216 0.977h-25.69q-1.277 0-2.216-0.977t-0.939-2.254v-19.23q0-1.277 0.939-2.254t2.216-0.977h9.615z"></path>'
      }
      const ulElement = document.createElement('ul')
      ulElement.className = 'tree-list'
      ulElement.innerHTML = `<li class="fn__flex fn__a" data-type="root">
<svg class="item__arrow" path="/" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="item__name" path="/">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${pathHTML}</svg>
  <span class="fn__ellipsis">${path.basename(dir.url)}</span>
</span>
</li>`

      window.liandi.liandi.ws.send('ls', {
        url: dir.url,
        path: '/',
      }, true)

      const getLeaf = (target) => {
        const filesString = target.getAttribute('files')
        if (!filesString) {
          return
        }
        if (target.classList.contains('item__arrow--open')) {
          target.classList.remove('item__arrow--open')
          target.parentElement.nextElementSibling.style.display = 'none'
          return
        }

        target.classList.add('item__arrow--open')

        const files = JSON.parse(filesString)
        let fileHTML = ''
        files.forEach((item) => {
          const style = ` style="padding-left: ${(item.path.split('/').length -
            (item.isdir ? 2 : 1)) * 13}px"`
          if (item.isdir) {
            fileHTML += `<li class="fn__a fn__flex"${style}>
<svg class="item__arrow" path="${item.path}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="item__name" path="${item.path}">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${pathHTML}</svg>
  <span class="fn__ellipsis">${item.name}</span>
</span>
</li>`
            window.liandi.liandi.ws.send('ls', {
              url: dir.url,
              path: item.path,
            }, true)
          } else {
            fileHTML += `<li${style} class="item__name--md item__name fn__a" data-path="${encodeURIComponent(
              item.path)}">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M29.693 25.847h-27.386c-1.274 0-2.307-1.033-2.307-2.307v0-15.081c0-1.274 1.033-2.307 2.307-2.307h27.386c1.274 0 2.307 1.033 2.307 2.307v15.079c0 0.001 0 0.002 0 0.003 0 1.274-1.033 2.307-2.307 2.307 0 0 0 0 0 0v0zM7.691 21.231v-6l3.078 3.847 3.076-3.847v6.001h3.078v-10.461h-3.078l-3.076 3.847-3.078-3.847h-3.078v10.464zM28.309 16h-3.078v-5.231h-3.076v5.231h-3.078l4.615 5.386z"></path></svg>
<span class="fn__ellipsis">${item.name.replace(/&/g, '&amp;').
              replace(/</g, '&lt;')}</span></li>`
          }
        })
        target.parentElement.insertAdjacentHTML('afterend',
          `<ul>${fileHTML}</ul>`)
      }

      const setCurrent = (target) => {
        window.liandi.liandi.navigation.element.querySelectorAll(
          'tree-list').forEach(item => {
          item.shadowRoot.querySelectorAll('li').forEach((liItem) => {
            liItem.classList.remove('item--current')
          })
        })

        target.classList.add('item--current')
      }

      let timeoutId
      ulElement.addEventListener('click', (event) => {
        let target = event.target
        window.liandi.liandi.current.dir = dir
        if (event.detail === 1) {
          timeoutId = setTimeout(() => {
            while (target && !target.isEqualNode(ulElement)) {
              if (target.classList.contains('item__arrow')) {
                getLeaf(target)
                setCurrent(target.parentElement)
                event.preventDefault()
                event.stopPropagation()
                break
              }

              if (target.classList.contains('item__name--md')) {
                setCurrent(target)
                window.liandi.liandi.editors.save(window.liandi.liandi)
                document.querySelector('.editor__empty').style.display = 'none'
                const path = decodeURIComponent(
                  target.getAttribute('data-path'))
                window.liandi.liandi.ws.send('get', {
                  url: dir.url,
                  path,
                })
                window.liandi.liandi.current.path = path
                event.preventDefault()
                event.stopPropagation()
                break
              }

              if (target.tagName === 'LI') {
                setCurrent(target)
                event.preventDefault()
                event.stopPropagation()
                break
              }
              target = target.parentElement
            }
          }, 300)
        } else if (event.detail === 2) {
          while (target && !target.isEqualNode(ulElement)) {
            if (target.classList.contains('fn__flex')) {
              getLeaf(target.firstElementChild)
              setCurrent(target)
              event.preventDefault()
              event.stopPropagation()
              break
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
