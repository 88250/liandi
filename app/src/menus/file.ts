import {remote} from "electron";
import {deleteMenu, newFileMenu, newFolderMenu, renameMenu, showInFolder} from "./commonMenuItem";
import {i18n} from "../i18n";

export const initFolderMenu = () => {
    const menu = new remote.Menu();
    menu.append(newFileMenu());
    menu.append(newFolderMenu());
    menu.append(deleteMenu());
    menu.append(renameMenu());
    menu.append(showInFolder());
    return menu;
};


export const initFileMenu = () => {
    const menu = new remote.Menu();
    menu.append(renameMenu());
    menu.append(deleteMenu());
    menu.append(showInFolder());
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].export,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            window.liandi.ws.send("exportmd", {
                url: itemData.url,
                path: itemData.path
            })
        }
    }));
    return menu;
};
