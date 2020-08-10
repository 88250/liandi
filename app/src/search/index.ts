import {i18n} from '../i18n';
import {destroyDialog, dialog} from '../util/dialog';
import {lauguage} from '../config/language';
import {about} from '../config/about';
import {theme} from '../config/theme';
import {initConfigSearch} from '../config/search';
import {markdown} from '../config/markdown';
import {image} from '../config/image';
import {help} from '../config/help';
import {escapeHtml} from "../util/escape";

export const initSearch = (liandi: ILiandi, type = 'search') => {
    dialog({
        content: `<tab-panel>
  <ul slot="tab" class="tab fn__flex">
    <li data-name="search" class="${type === 'search' ? 'tab--current ' : ''}fn__pointer">${i18n[liandi.config.lang].search}</li>
    <li data-name="config" class="${type !== 'search' ? 'tab--current ' : ''}fn__pointer">${i18n[liandi.config.lang].config}</li>
    <li class="fn__flex-1"></li>
  </ul>
  <div data-name="search"${type === 'search' ? ' slot="panel"' : ''}>
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <div class="list--signal" style="height: 403px"></div>
  </div>
  <div data-name="config"${type !== 'search' ? ' slot="panel"' : ''}>
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <tab-panel type="vertical">
      <ul slot="tab" class="tab tab--vertical">
        <li data-name="markdown" class="tab--current fn__pointer">Markdown</li>
        <li data-name="image" class="fn__pointer">${i18n[liandi.config.lang].image}</li>
        <li data-name="theme" class="fn__pointer">${i18n[liandi.config.lang].theme}</li>
        <li data-name="language" class="fn__pointer">${i18n[liandi.config.lang].language}</li>
        <li data-name="about" class="fn__pointer">${i18n[liandi.config.lang].about}</li>
        <li data-name="help" class="fn__pointer">${i18n[liandi.config.lang].help}</li>
      </ul>
      <div class="tab__panel" data-name="markdown" slot="panel">${markdown.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="image">${image.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="theme">${theme.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="language">${lauguage.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="about">${about.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="help">${help.genHTML(liandi)}</div>
    </tab-panel>
  </div>
</tab-panel>`,
        width: Math.max(window.innerWidth - 520, 600),
        height: 520,
        destroyDialogCallback: () => {
            liandi.editors.focus();
        }
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
    inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.isComposing) {
            return;
        }
        if (event.key === 'Escape') {
            destroyDialog(() => {
                liandi.editors.focus();
            });
            event.preventDefault();
        }
        let currentList: HTMLElement = dialogElement.querySelector('div[data-name="search"] .list__item--current');

        if (event.code === 'ArrowDown') {
            if (currentList.nextElementSibling) {
                currentList.classList.remove('list__item--current');
                currentList = currentList.nextElementSibling as HTMLElement;
                currentList.classList.add('list__item--current');
                if (currentList.parentElement.scrollTop + 478 < currentList.offsetTop) {
                    currentList.parentElement.scrollTop = currentList.offsetTop - 478;
                }
            }
            event.preventDefault();
        } else if (event.code === 'ArrowUp') {
            if (currentList.previousElementSibling) {
                currentList.classList.remove('list__item--current');
                currentList = currentList.previousElementSibling as HTMLElement;
                currentList.classList.add('list__item--current');
                if (currentList.parentElement.scrollTop > currentList.offsetTop - 107) {
                    currentList.parentElement.scrollTop = currentList.offsetTop - 107;
                }
            }
            event.preventDefault();
        } else if (event.code === 'Enter') {
            quickOpenFile(liandi, dialogElement);
            event.preventDefault();
        }
    });

    const searchPanelElement = dialogElement.querySelector('div[data-name="search"]');
    searchPanelElement.addEventListener('dblclick', (event) => {
        let target = event.target as HTMLElement;
        while (target && !target.parentElement.isEqualNode(searchPanelElement)) {
            if (target.classList.contains('list__item')) {
                dialogElement.querySelector('.list__item--current').classList.remove('list__item--current');
                target.classList.add('list__item--current');
                quickOpenFile(liandi, dialogElement);
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    }, false);

    initConfigSearch(liandi, dialogElement.querySelector('div[data-name="config"]'));
    about.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="about"]'));
    lauguage.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="language"]'));
    theme.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="theme"]'));
    markdown.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="markdown"]'));
    image.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="image"]'));
};

export const quickOpenFile = (liandi: ILiandi, dialogElement: Element) => {
    liandi.editors.save(liandi);

    const currentList: HTMLElement = dialogElement.querySelector('div[data-name="search"] .list__item--current');
    liandi.current.dir = JSON.parse(decodeURIComponent(currentList.getAttribute("data-dir")));
    liandi.current.path = decodeURIComponent(currentList.getAttribute('data-path'));

    liandi.ws.send('searchget', {
        url: liandi.current.dir.url,
        path: liandi.current.path,
        index: currentList.getAttribute('data-index'),
        key: (dialogElement.querySelector('.input') as HTMLInputElement).value
    });
    destroyDialog();
};

export const onSearch = (liandi: ILiandi, data: {
    dir: IDir
    path: string
    content: string
    ln: number
    col: number
    index: number
}[]) => {
    let resultHTML = '';
    data.forEach((item, index) => {
        resultHTML += `<div class="list__item fn__flex${index === 0 ? ' list__item--current' : ''}" data-dir="${encodeURIComponent(JSON.stringify(item.dir))}" data-path="${encodeURIComponent(item.path)}" data-index="${item.index}">
<span class="fn__flex-1 fn__ellipsis">${escapeHtml(item.content).replace("&lt;mark", "<mark").replace("&lt;/mark", "</mark")}</span>
<span class="fn__space"></span>
<span class="ft__smaller ft__secondary">${escapeHtml(item.path)} ${item.ln}:${item.col}</span>
</div>`;
    });

    const panelElement = document.querySelector('#dialog div[data-name="search"]');
    panelElement.querySelector('.list--signal').innerHTML = resultHTML;
};
