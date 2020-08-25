import {remote, clipboard} from "electron";
import {i18n} from "../i18n";

export const initVditorMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].pasteAsPlainText,
        id: "pasteAsPlainText",
        accelerator: "CmdOrCtrl+Shift+Alt+V",
        click: () => {
            remote.getCurrentWindow().webContents.pasteAndMatchStyle();
        }
    }));
    return menu;
};

export const initVditorIconMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].copyId,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            clipboard.writeText(itemData.target.parentElement.getAttribute("data-node-id"))
        }
    }));
    return menu;
};
