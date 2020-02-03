import {initFilesMenu, initFilesSpaceMenu} from './files';
import {initNavigationMenu} from './navigation';
import {initMountMenu} from './mount';

export class Menus {
    public itemData: {
        target?: HTMLElement
        name?: string
        url: string
        path?: string
    };

    constructor(liandi: ILiandi) {

        const filesMenu = initFilesMenu(liandi);
        const filesSpaceMenu = initFilesSpaceMenu(liandi);
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

                if (target.tagName === 'TREE-LIST') {
                    this.itemData = {
                        target,
                        url: target.getAttribute('url'),
                    };
                    navigationMenu.popup({
                        callback: () => {
                            target.classList.remove('list__item--focus');
                        }
                    });
                    target.parentElement.querySelectorAll('tree-list').forEach(item => {
                        item.classList.remove('list__item--focus');
                    });
                    target.classList.add('list__item--focus');
                    event.preventDefault();
                    break;
                }

                if (target.tagName === 'FILE-ITEM') {
                    this.itemData = {
                        target,
                        name: target.getAttribute('name'),
                        url: liandi.current.dir.url,
                        path: target.getAttribute('path'),
                    };

                    filesMenu.popup({
                        callback: () => {
                            target.shadowRoot.querySelector('.list__item').classList.remove('list__item--focus');
                        }
                    });

                    if (!target.shadowRoot.querySelector('.list__item').classList.contains('list__item--current')) {
                        liandi.files.listElement.querySelectorAll('file-item').forEach(item => {
                            item.shadowRoot.querySelector('.list__item').classList.remove('list__item--focus');
                        });
                        target.shadowRoot.querySelector('.list__item').classList.add('list__item--focus');
                    }
                    event.preventDefault();
                    break;
                }

                if (target.classList.contains('files__list') && liandi.current.dir && liandi.current.dir.url) {
                    this.itemData = {
                        url: liandi.current.dir.url,
                        path: liandi.current.path
                    };
                    filesSpaceMenu.popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }
}
