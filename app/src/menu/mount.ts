import {remote} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {mountFile, mountWebDAV} from '../util/mount';

export const initMountMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].mount,
        click: async () => {
            mountFile(liandi);
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].mountWebDAV,
        click: async () => {
            mountWebDAV(liandi);
        }
    }));
    return menu;
};
