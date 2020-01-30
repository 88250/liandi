import {remote} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {homedir} from 'os';
import {mountFile, mountWebDAV} from "../util/mount";

export const initNavigationMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].mount,
        click: async () => {
            mountFile(liandi.ws.webSocket)
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].mountWebDAV,
        click: async () => {
            mountWebDAV(liandi.ws.webSocket)
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].unMount,
        click: () => {
            const itemData = liandi.menus.itemData;
            liandi.ws.webSocket.send(JSON.stringify({
                cmd: 'unmount',
                param: {
                    url:itemData.url
                }
            }));
            liandi.menus.itemData.target.remove();
            const filesFileItemElement = liandi.files.listElement.firstElementChild;
            if (filesFileItemElement && filesFileItemElement.tagName === 'FILE-ITEM'
                && filesFileItemElement.getAttribute('url') === itemData.url) {
                liandi.files.listElement.innerHTML = '';
                liandi.files.element.firstElementChild.innerHTML = '';
                liandi.editors.remove(liandi);
            }
        }
    }));
    return menu;
};
