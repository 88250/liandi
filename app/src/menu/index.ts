import {remote} from 'electron';
import {url} from 'inspector';
import {i18n} from "../i18n";
import {Constants} from "../constants";
import {showMessage} from "../util/message";

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
                showMessage('TODO')
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
                showMessage('TODO')
            }
        }));

        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'FILE-ITEM') {
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
