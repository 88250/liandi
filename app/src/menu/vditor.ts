import {remote} from 'electron';
import {i18n} from '../i18n';

export const initVditorMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].pasteAsPlainText,
        id: 'pasteAsPlainText',
        accelerator: 'CmdOrCtrl+Shift+Alt+V',
        click: () => {
            remote.getCurrentWindow().webContents.pasteAndMatchStyle()
        }
    }));
    return menu;
};
