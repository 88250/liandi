import {remote} from "electron";
import {i18n} from "../i18n";
import {newFileMenu, newFolderMenu, showInFolder} from "./commonMenuItem";

export const initNavigationMenu = () => {
    const menu = new remote.Menu();
    menu.append(newFileMenu());
    menu.append(newFolderMenu());
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].unMount,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            window.liandi.ws.send("unmount", {
                url: itemData.url,
                pushMode: 0
            });
        }
    }));
    menu.append(showInFolder());
    return menu;
};
