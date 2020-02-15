import {i18n} from '../i18n';
import {destroyDialog, dialog} from '../util/dialog';
import {lauguage} from '../config/language';
import {about} from '../config/about';
import {theme} from '../config/theme';
import {initConfigSearch} from '../config/search';
import {getPath, removeLastPath} from '../util/path';
import {markdown} from '../config/markdown';

export const quickOpenFile = (liandi: ILiandi, dialogElement: Element) => {
    let currentList: HTMLElement = dialogElement.querySelector('div[data-name="search"] .list__item--current');

    liandi.editors.saveContent(liandi);

    const currentNavigationElement =
        liandi.navigation.element.querySelector(`tree-list[url="${currentList.getAttribute('data-url')}"]`);

    liandi.current.dir = JSON.parse(decodeURIComponent(currentNavigationElement.getAttribute('dir')));
    liandi.current.path = currentList.getAttribute('data-path');

    const currentTreeElement = currentNavigationElement.shadowRoot.querySelector('.list__item--current');
    if (currentTreeElement) {
        currentTreeElement.classList.remove('list__item--current');
    }
    const currentTreeFolderElement = currentNavigationElement.shadowRoot.querySelector(`.tree-list__folder[path="${removeLastPath(liandi.current.path)}"]`);
    if (currentTreeFolderElement) {
        currentTreeFolderElement.parentElement.classList.add('list__item--current');
    }

    window.liandi.liandi.ws.send('ls', {
        url: liandi.current.dir.url,
        path: getPath(liandi.current.path)
    });
    liandi.ws.send('get', {
        url: liandi.current.dir.url,
        path: liandi.current.path
    });
    destroyDialog();
}

export const initSearch = (liandi: ILiandi) => {
    dialog({
        content: `<tab-panel>
  <ul slot="tab" class="tab fn__flex">
    <li data-name="search" class="tab--current fn__pointer">${i18n[liandi.config.lang].search}</li>
    <li data-name="config" class="fn__pointer">${i18n[liandi.config.lang].config}</li>
    <li class="fn__flex-1"></li>
  </ul>
  <div data-name="search" slot="panel">
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <div class="list--signal" style="height: 403px"></div>
  </div>
  <div data-name="config">
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <tab-panel type="vertical">
      <ul slot="tab" class="tab tab--vertical">
        <li data-name="markdown" class="tab--current fn__pointer">Markdown</li>
        <li data-name="theme" class="fn__pointer">${i18n[liandi.config.lang].theme}</li>
        <li data-name="language" class="fn__pointer">${i18n[liandi.config.lang].language}</li>
        <li data-name="about" class="fn__pointer">${i18n[liandi.config.lang].about}</li>
      </ul>
      <div class="tab__panel" data-name="markdown" slot="panel">${markdown.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="theme">${theme.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="language">${lauguage.genHTML(liandi)}</div>
      <div class="tab__panel" data-name="about">${about.genHTML(liandi)}</div>
    </tab-panel>
  </div>
</tab-panel>`,
        width: Math.max(window.innerWidth - 520, 600),
        height: 520
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
            quickOpenFile(liandi, dialogElement)
            event.preventDefault();
        }
    });

    const searchPanelElement = dialogElement.querySelector('div[data-name="search"]');
    searchPanelElement.addEventListener("dblclick", (event) => {
        let target = event.target as HTMLElement
        while (target && !target.parentElement.isEqualNode(searchPanelElement)) {
            if (target.classList.contains('list__item')) {
                quickOpenFile(liandi, dialogElement)
                event.preventDefault()
                event.stopPropagation()
                break
            }
            target = target.parentElement
        }
    }, false);

    initConfigSearch(liandi, dialogElement.querySelector('div[data-name="config"]'));
    about.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="about"]'));
    lauguage.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="language"]'));
    theme.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="theme"]'));
    markdown.bindEvent(liandi, dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="markdown"]'));
};

export const onSearch = (liandi: ILiandi, data: {
    content: string,
    line: number
    path: string
    pos: number
    url: string
}[]) => {
    let resultHTML = '';
    data.forEach((item, index) => {
        resultHTML += `<div class="list__item fn__flex${index === 0 ? ' list__item--current' : ''}"
title="${item.content}" data-url="${item.url}" data-path="${item.path}">
<span class="fn__flex-1 fn__ellipsis">${item.content}</span>
<span class="fn__space"></span>
<span class="ft__smaller ft__secondary">${item.path} ${item.line}:${item.pos}</span>
</div>`;
    });

    const panelElement = document.querySelector('#dialog div[data-name="search"]');
    panelElement.querySelector('.list--signal').innerHTML = resultHTML;
};
