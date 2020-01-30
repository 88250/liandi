import {initFilesMenu} from './files';
import {initNavigationMenu} from './navigation';

export class Menus {
    public itemData: {
        target?: HTMLElement
        name?: string
        url: string
        path: string
    };

    constructor(liandi: ILiandi) {

        const filesMenu = initFilesMenu(liandi);
        const navigationMenu = initNavigationMenu(liandi);
        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'FILE-ITEM') {
                    let isTarget = false;
                    if (target.parentElement.classList.contains('files__list')) {
                        isTarget = true;
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
                    } else if (target.parentElement.classList.contains('navigation')) {
                        isTarget = true;
                        navigationMenu.items[2].enabled = true;
                        navigationMenu.popup({
                            callback: () => {
                                if (target.parentElement) {
                                    target.parentElement.querySelectorAll('file-item').forEach(item => {
                                        item.classList.remove('focus');
                                    });
                                }
                            }
                        });
                    }

                    if (isTarget) {
                        this.itemData = {
                            target,
                            name: target.getAttribute('name'),
                            url: target.getAttribute('url'),
                            path: target.getAttribute('path'),
                        };
                        if (!target.classList.contains('current')) {
                            target.parentElement.querySelectorAll('file-item').forEach(item => {
                                item.classList.remove('focus');
                            });
                            target.classList.add('focus');
                        }
                        event.preventDefault();
                        break;
                    }
                }

                if (target.classList.contains('files__list') && liandi.current) {
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

                if (target.classList.contains('navigation')) {
                    navigationMenu.items[2].enabled = false;
                    navigationMenu.popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }
}
