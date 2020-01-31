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
      ulElement.innerHTML = `<li>
<svg path="/" class="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"></svg>
<span class="folder" path="/">
  <svg class="fold" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
  <span>${getName(url)}</span>
</span>
</li>`

      const style = document.createElement('style');
      style.innerText =`
ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
}
li {
    padding: 5px 10px;
    line-height: 18px;
    user-select: none;
    display: flex;
    align-items: center;
    color: #3b3e43;
    transition: all .15s ease-in-out;
}
li:hover {
   color: #000;
}
li:hover svg {
  color: rgba(0, 0, 0, .54);
}
li.current {
  background-color: #4285f4;
  color: #fff;
}
svg {
    margin-right: 5px;
    fill: currentColor;
    color: rgba(0, 0, 0, .38);
    transition: all .15s ease-in-out;
    flex-shrink: 0;
}
.arrow {
    height: 8px;
    width: 8px;
    cursor: pointer;
}
.arrow--open {
   transform: rotate(90deg);
}
.fold {
    height: 14px;
    width: 14px;
    float: left;
    margin: 2px 5px 0 0;
}
.folder {
    cursor: pointer;
    flex: 1;
    white-space: nowrap;
    word-break: keep-all;
    text-overflow: ellipsis;
    overflow: hidden;
}`

      window.liandi.liandi.ws.send('lsd', {
        url,
        path: '/',
      }, true)

      ulElement.addEventListener('click',  (event) => {
        let target = event.target
        while (target && !target.parentElement.isEqualNode(ulElement)) {
          if (target.classList.contains('folder')) {
            if (target.parentElement.classList.contains('current')) {
              return
            }

            window.liandi.liandi.navigation.element.querySelectorAll('tree-list').forEach(item => {
              item.shadowRoot.querySelectorAll('li').forEach((liItem) => {
                liItem.classList.remove('current')
              })
            })

            target.parentElement.classList.add('current')
            window.liandi.liandi.editors.remove(window.liandi.liandi)
            window.liandi.liandi.ws.send('ls', {
              url,
              path: target.getAttribute('path'),
            })
            event.preventDefault()
            break
          }

          if (target.classList.contains('arrow')) {
            const filesString = target.getAttribute('files')
            if (!filesString) {
              return
            }
            if (target.classList.contains('arrow--open')) {
              target.classList.remove('arrow--open')
              target.parentElement.nextElementSibling.style.display = 'none'
              return
            }

            target.classList.add('arrow--open')

            const files = JSON.parse(filesString)
            let fileHTML = ''
            files.forEach((item) => {
              fileHTML += `<li style="padding-left: ${(item.path.split(
                '/').length - 2) * 13 + 10}px">
<svg class="arrow" path="${item.path}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"></svg>
<span class="folder" path="${item.path}">
  <svg class="fold" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${pathHTML}</svg>
  ${item.name}
</span>
</li>`
              window.liandi.liandi.ws.send('lsd', {
                url,
                path: item.path,
              }, true)
            })
            target.parentElement.insertAdjacentHTML('afterend',
              `<ul>${fileHTML}</ul>`)
            event.preventDefault()
            break
          }

          target = target.parentElement
        }
      }, false)

      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.appendChild(style)
      shadowRoot.appendChild(ulElement)
    }
  })
