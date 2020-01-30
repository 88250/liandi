import {initFilesMenu} from "./files";
import {initNavigationMenu} from "./navigation";

export class Menus {
    public itemData: {
        target: HTMLElement
    }

    constructor(liandi: ILiandi) {

        const filesMenu = initFilesMenu(liandi)
        const navigationMenu = initNavigationMenu(liandi)
        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'FILE-ITEM') {
                    let isTarget = false
                    if (target.parentElement.classList.contains('files__list')) {
                        isTarget = true
                        filesMenu.popup({
                            callback: () => {
                                target.parentElement.querySelectorAll('file-item').forEach(item => {
                                    item.classList.remove('focus')
                                })
                            }
                        });
                    } else if (target.parentElement.classList.contains('navigation__list')) {
                        isTarget = true
                        navigationMenu.popup({
                            callback: () => {
                                target.parentElement.querySelectorAll('file-item').forEach(item => {
                                    item.classList.remove('focus')
                                })
                            }
                        });
                    }

                    if (isTarget) {
                        this.itemData = {target};
                        if (!target.classList.contains('current')) {
                            target.parentElement.querySelectorAll('file-item').forEach(item => {
                                item.classList.remove('focus')
                            })
                            target.classList.add('focus')
                        }
                        event.preventDefault();
                        break;
                    }
                }

                target = target.parentElement;
            }
        }, false);
    }
}
