import {remote} from 'electron';
import * as path from 'path';
import {i18n} from '../i18n';

export const initBacklinksMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].openInNewWindow,
        click: () => {
            const itemData = liandi.menus.itemData;
            liandi.ws.send("exec", {
                bin: remote.process.execPath,
                args: [path.posix.join(remote.app.getAppPath(), "main.js"), `--liandi-url=${itemData.dir.url}`, `--liandi-path=${itemData.path}`]
            })
        }
    }));
    return menu;
};
