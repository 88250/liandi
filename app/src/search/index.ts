import {i18n} from "../i18n";
import {Constants} from "../constants";
import {dialog} from "../util/dialog";
import {initLauguage} from "../config/language";

export const initSearch = (liandi: ILiandi) => {
    dialog({
        content: `<tab-panel>
  <ul slot="tab" class="tab fn__flex">
    <li data-name="search" class="tab--current fn__pointer">${i18n[liandi.config.lang].search}</li>
    <li data-name="config" class="fn__pointer">${i18n[liandi.config.lang].config}</li>
    <li class="fn__flex-1"></li>
  </ul>
  <div slot="ext">
     <div class="fn__hr"></div>
     <input class="input">
     <div class="fn__hr"></div>
  </div>
  <div data-name="search" slot="panel">searchPanel</div>
  <div data-name="config">
    <tab-panel>
      <ul slot="tab" class="tab fn__flex">
        <li data-name="markdown" class="tab--current fn__pointer">Markdown</li>
        <li data-name="theme" class="fn__pointer">${i18n[liandi.config.lang].theme}</li>
        <li data-name="language" class="fn__pointer">${i18n[liandi.config.lang].language}</li>
      </ul>
      <div data-name="markdown" slot="panel">m</div>
      <div data-name="theme">t</div>
      <div data-name="language">l</div>
    </tab-panel>
  </div>
</tab-panel>`,
        width: 600
    })

    const dialogElement = document.querySelector('#dialog')
    const inputElement = dialogElement.querySelector('.input') as HTMLInputElement
    inputElement.focus()

    inputElement.addEventListener("compositionend", () => {
        liandi.ws.send('search', {
            k: inputElement.value
        })
    });
    inputElement.addEventListener('input', (event: InputEvent) => {
        if (event.isComposing) {
            return
        }

        liandi.ws.send('search', {
            k: inputElement.value
        })
    })

    dialogElement.querySelectorAll('div[data-name="config"] .list__item').forEach((item) => {
        item.addEventListener('click', function () {
            switch (this.getAttribute('data-type')) {
                case 'language':
                    initLauguage(liandi)
                    break;
            }
        })
    })
}
