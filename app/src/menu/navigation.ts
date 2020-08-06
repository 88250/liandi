import {remote} from 'electron';
import {i18n} from '../i18n';
import {newFile, newFolder, showInFolder} from './commonMenuItem';

export const initNavigationMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(newFile(liandi));
    menu.append(newFolder(liandi));
    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].unMount,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (liandi.current.dir && liandi.current.dir.url === itemData.url) {
                liandi.editors.close(liandi);
                liandi.current = {
                    path: '',
                };
            }
            liandi.ws.send('unmount', {
                url: itemData.url
            });
            itemData.target.remove();
        }
    }));
    menu.append(showInFolder(liandi));
    return menu;
};
