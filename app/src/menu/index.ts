import {remote} from 'electron';
import {url} from "inspector";

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
            label: 'unmount',
            click: () => {
                liandi.ws.webSocket.send(JSON.stringify({
                    'cmd': 'unmount',
                    'param': {
                        'url': this.fileItemMenu.data.url,
                    }
                }));
                this.fileItemMenu.data.target.remove();
                const filesFileItemElement = liandi.files.listElement.firstElementChild
                if (filesFileItemElement && filesFileItemElement.tagName === 'FILE-ITEM'
                    && filesFileItemElement.getAttribute("url") === this.fileItemMenu.data.url) {
                    liandi.files.listElement.innerHTML = "";
                    liandi.files.element.firstElementChild.innerHTML = "";
                    liandi.editors.element.innerHTML = "";
                }
            }
        }));

        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'FILE-ITEM' && target.parentElement.classList.contains('navigation__list')) {
                    this.fileItemMenu.data = {
                        url: target.getAttribute('url'),
                        target
                    };
                    this.fileItemMenu.menu.popup();
                    event.preventDefault();
                    break;
                }
                target = target.parentElement;
            }
        }, false);
    }
}
