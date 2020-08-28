import {remote} from "electron";
import {i18n} from "../i18n";
import {copyBlockId} from "./commonMenuItem";
import {copyTab, getInstanceById} from "../layout/util";
import {Tab} from "../layout/Tab";

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
    menu.append(copyBlockId());
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].graphView,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id");
            const currentTab = getInstanceById(id) as Tab;
            currentTab.parent.split("lr").addTab(copyTab(currentTab));
        }
    }));
    return menu;
};
