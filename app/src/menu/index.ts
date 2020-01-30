import {initFilesMenu} from './files';
import {initNavigationMenu} from './navigation';
import {initMountMenu} from "./mount";

export class Menus {
    public itemData: {
        target?: HTMLElement
        name?: string
        url: string
        path?: string
    };

    constructor(liandi: ILiandi) {

        const filesMenu = initFilesMenu(liandi);
        const navigationMenu = initNavigationMenu(liandi);
        const mountMenu = initMountMenu(liandi);
        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.classList.contains('navigation')) {
                    mountMenu.popup();
                    event.preventDefault();
                    break;
                }

                if (target.tagName === 'TREE-ITEM') {
                    this.itemData = {
                        target,
                        url: target.getAttribute('url'),
                    };
                    navigationMenu.popup({
                        callback: () => {
                            if (target.parentElement) {
                                target.parentElement.querySelectorAll('tree-item').forEach(item => {
                                    item.classList.remove('focus');
                                });
                            }
                        }
                    });
                    if (!target.classList.contains('current')) {
                        target.parentElement.querySelectorAll('file-item').forEach(item => {
                            item.classList.remove('focus');
                        });
                        target.classList.add('focus');
                    }
                    event.preventDefault();
                    break;
                }

                if (target.tagName === 'FILE-ITEM') {
                    this.itemData = {
                        target,
                        name: target.getAttribute('name'),
                        url: liandi.current.url,
                        path: target.getAttribute('path'),
                    };

                    filesMenu.items[2].enabled = true;
                    filesMenu.items[3].enabled = true;
                    filesMenu.popup({
                        callback: () => {
                            if (target.parentElement) {
                                target.parentElement.querySelectorAll('file-item').forEach(item => {
                                    item.classList.remove('focus');
                                });
                            }
                        }
                    });

                    if (!target.classList.contains('current')) {
                        target.parentElement.querySelectorAll('file-item').forEach(item => {
                            item.classList.remove('focus');
                        });
                        target.classList.add('focus');
                    }
                    event.preventDefault();
                    break;
                }

                if (target.classList.contains('files__list') && liandi.current.url) {
                    this.itemData = {
                        url: liandi.current.url,
                        path: liandi.current.path
                    };
                    filesMenu.items[2].enabled = false;
                    filesMenu.items[3].enabled = false;
                    filesMenu.popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }
}
