import {i18n} from '../i18n';
import {dialog} from '../util/dialog';
import {lauguage} from '../config/language';
import {theme} from "../config/theme";

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
    <tab-panel type="vertical">
      <ul slot="tab" class="tab tab--vertical">
        <li data-name="markdown" class="tab--current fn__pointer">Markdown</li>
        <li data-name="theme" class="fn__pointer">${i18n[liandi.config.lang].theme}</li>
        <li data-name="language" class="fn__pointer">${i18n[liandi.config.lang].language}</li>
      </ul>
      <div class="tab__panel" data-name="markdown" slot="panel">markdown</div>
      <div class="tab__panel" data-name="theme">${theme.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="language">${lauguage.genHTML(liandi)}</div>
    </tab-panel>
  </div>
</tab-panel>`,
        width: 600
    });

    const dialogElement = document.querySelector('#dialog');
    const inputElement = dialogElement.querySelector('.input') as HTMLInputElement;
    inputElement.focus();

    inputElement.addEventListener('compositionend', () => {
        liandi.ws.send('search', {
            k: inputElement.value
        });
    });
    inputElement.addEventListener('input', (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }

        liandi.ws.send('search', {
            k: inputElement.value
        });
    });

    lauguage.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="language"]'));
    theme.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="theme"]'));
};
