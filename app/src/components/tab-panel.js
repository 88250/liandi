customElements.define('tab-panel',
  class extends HTMLElement {
    constructor () {
      super()

      const isVertical = this.getAttribute('type') === 'vertical'
      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.innerHTML = `<div${isVertical ? ' style="display:flex"' : ''}>
  <slot name="tab"></slot>
  <div ${isVertical ? ' style="flex:1"' : ''}"><slot name="ext"></slot><slot name="panel"></slot></div>
</div>`

      const tabs = Array.from(this.firstElementChild.children).filter(item => {
        return item.getAttribute('data-name')
      })
      const panels = Array.from(this.children).filter(item => {
        return item.getAttribute('data-name')
      })

      tabs.forEach(item => {
        item.addEventListener('click', () => {
          tabs.forEach(tabItem => {
            tabItem.classList.remove('tab--current')
          })
          item.classList.add('tab--current')

          panels.forEach(description => {
            if (description.getAttribute('data-name') ===
              item.getAttribute('data-name')) {

              description.setAttribute('slot', 'panel')

              const inputElement = description.querySelector('input')
              if (inputElement) {
                inputElement.focus()
              } else {
                // 如果 select 选中的话，切换 description 不会替换
                item.focus()
              }
            }
          })
          // 如果先移除 slot 的话，tab--current 会失效
          panels.forEach(description => {
            if (description.getAttribute('data-name') !==
              item.getAttribute('data-name')) {
              description.removeAttribute('slot')
            }
          })
        })
      })
    }
  },
)
