import {initFolderMenu, initFileMenu} from './file';
import {initNavigationMenu} from './navigation';
import {initMountMenu} from './mount';

export class Menus {
    public itemData: IMenuData;

    constructor(liandi: ILiandi) {

        const folderMenu = initFolderMenu(liandi);
        const fileMenu = initFileMenu(liandi);
        const navigationMenu = initNavigationMenu(liandi);
        const mountMenu = initMountMenu(liandi);
        window.addEventListener('contextmenu', (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.classList.contains('navigation')) {
                    // navigation 空白：挂载目录/挂载 DAV
                    mountMenu.popup();
                    event.preventDefault();
                    break;
                }

                if (target.getAttribute("data-type") === 'navigation-root') {
                    // navigation 根上：新建文档/文件夹/取消挂在/打开文件位置
                    const dir = JSON.parse(decodeURIComponent(target.parentElement.getAttribute("data-dir")))
                    this.itemData = {
                        target,
                        path: "/",
                        url: dir.url
                    };
                    navigationMenu.popup();
                    event.preventDefault();
                    break;
                }

                if (target.getAttribute("data-type") === 'navigation-folder') {
                    // navigation 文件夹上：新建文档/文件夹/删除/重命名/打开文件位置
                    this.itemData = {
                        target,
                        name: decodeURIComponent(target.getAttribute('name')).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
                        url: liandi.current.dir.url,
                        path: decodeURIComponent(target.getAttribute('path')),
                    };

                    folderMenu.popup();
                    event.preventDefault();
                    break;
                }

                if (target.getAttribute("data-type") === 'navigation-file') {
                    // navigation 文件上：删除/重命名/打开文件位置
                    this.itemData = {
                        url: liandi.current.dir.url,
                        path: liandi.current.path
                    };
                    fileMenu.popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }
}
