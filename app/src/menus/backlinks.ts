import {remote} from "electron";
import * as path from "path";
import {i18n} from "../i18n";

// TODO 打开新应用，目前没有使用到
export const initBacklinksMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].openInNewWindow,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            window.liandi.ws.send("exec", {
                bin: remote.process.execPath,
                args: [path.posix.join(remote.app.getAppPath(), "main.js"), `--liandi-url=${itemData.url}`, `--liandi-path=${itemData.path}`]
            });
        }
    }));
    return menu;
};
