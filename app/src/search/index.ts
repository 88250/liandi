import {i18n} from "../i18n";
import {Constants} from "../constants";
import {dialog} from "../util/dialog";

export const initSearch = (liandi: ILiandi) => {
    dialog({
        content: `<tab-panel>
  <ul slot="tab" class="tab fn__flex">
    <li data-name="search" class="tab--current fn__pointer">${i18n[Constants.LANG].search}</li>
    <li data-name="config" class="fn__pointer">${i18n[Constants.LANG].config}</li>
    <li class="fn__flex-1"></li>
  </ul>
  <div slot="ext">
     <div class="fn__hr"></div>
     <input class="input">
     <div class="fn__hr"></div>
  </div>
  <div data-name="search" slot="panel">searchPanel</div>
  <div data-name="config">Config panel.</div>
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
    inputElement.addEventListener('input',  (event: InputEvent) => {
        if (event.isComposing) {
            return
        }

        liandi.ws.send('search', {
            k: inputElement.value
        })
    })
}
