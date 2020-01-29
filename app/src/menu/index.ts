import {remote} from 'electron';
import {url} from 'inspector';
import {i18n} from "../i18n";
import {Constants} from "../constants";
import {showMessage} from "../util/message";
import {destroyDialog, dialog} from "../util/dialog";
import {rename} from "../util/rename";

export class Menus {
    public fileItemMenu: {
        menu: Electron.Menu,
        data?: {
            url: string,
            target: HTMLElement
        }
    };

    constructor(liandi: ILiandi) {
        this.fileItemMenu = {
            menu: new remote.Menu()
        };
        this.fileItemMenu.menu.append(new remote.MenuItem({
            label: i18n[Constants.LANG].remove,
            click: () => {
                liandi.ws.webSocket.send(JSON.stringify({
                    'cmd': 'unmount',
                    'param': {
                        'url': this.fileItemMenu.data.url,
                    }
                }));
                this.fileItemMenu.data.target.remove();
                const filesFileItemElement = liandi.files.listElement.firstElementChild;
                if (filesFileItemElement && filesFileItemElement.tagName === 'FILE-ITEM'
                    && filesFileItemElement.getAttribute('url') === this.fileItemMenu.data.url) {
                    liandi.files.listElement.innerHTML = '';
                    liandi.files.element.firstElementChild.innerHTML = '';
                    liandi.editors.remove(liandi);
                }
            }
        }));

        this.fileItemMenu.menu.append(new remote.MenuItem({
            label: i18n[Constants.LANG].newFile,
            click: () => {
                showMessage('TODO', 0)
            }
        }));

        this.fileItemMenu.menu.append(new remote.MenuItem({
            label: i18n[Constants.LANG].newFolder,
            click: () => {
                showMessage('TODO')
            }
        }));

        this.fileItemMenu.menu.append(new remote.MenuItem({
            label: i18n[Constants.LANG].delete,
            click: () => {
                showMessage('TODO')
            }
        }));

        this.fileItemMenu.menu.append(new remote.MenuItem({
            label: i18n[Constants.LANG].rename,
            click: () => {
                const target = this.fileItemMenu.data.target;
                dialog({
                    title: i18n[Constants.LANG].rename,
                    content: `<input class="input" value="${target.getAttribute('name')}">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                    width: 400
                })
                const dialogElement = document.querySelector('#dialog')
                dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                    destroyDialog()
                })
                dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                    const newPath = rename((dialogElement.querySelector('.input') as HTMLInputElement).value,
                        target.getAttribute('url'), target.getAttribute('path'))

                    if (newPath) {
                        destroyDialog()
                    }
                })
            }
        }));

        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'FILE-ITEM' &&
                    (!target.parentElement.classList.contains('files__back') ||
                        target.parentElement.classList.contains('navigation__list'))) {
                    this.fileItemMenu.data = {
                        url: target.getAttribute('url'),
                        target
                    };
                    if (target.parentElement.classList.contains('navigation__list')) {
                        this.fileItemMenu.menu.items[0].enabled = true;
                        this.fileItemMenu.menu.items[3].enabled = false;
                        this.fileItemMenu.menu.items[4].enabled = false;
                    } else {
                        this.fileItemMenu.menu.items[0].enabled = false;
                        this.fileItemMenu.menu.items[3].enabled = true;
                        this.fileItemMenu.menu.items[4].enabled = true;
                    }
                    this.fileItemMenu.menu.popup();
                    event.preventDefault();
                    break;
                }
                target = target.parentElement;
            }
        }, false);
    }
}
