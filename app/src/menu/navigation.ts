import {remote} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {showInFolder} from './commonMenuItem';

export const initNavigationMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();

    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].unMount,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (itemData.target.shadowRoot.querySelector('.list__item').classList.contains('list__item--current')) {
                liandi.files.listElement.innerHTML = '';
                liandi.files.element.firstElementChild.innerHTML = '';
                liandi.editors.remove(liandi);
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
