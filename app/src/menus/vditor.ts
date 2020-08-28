import {remote} from "electron";
import {i18n} from "../i18n";
import {copyBlockId} from "./commonMenuItem";
import {getInstanceById} from "../layout/util";
import {Tab} from "../layout/Tab";
import {Editor} from "../editor";
import {Wnd} from "../layout/Wnd";
import {escapeHtml} from "../util/escape";
import {Graph} from "../graph";
import * as path from "path"
import {hasClosestByClassName} from "../../vditore/src/ts/util/hasClosest";

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
            const itemTarget = window.liandi.menus.itemData.target;
            const vditorElement = hasClosestByClassName(itemTarget, "vditor", true)
            if (vditorElement) {
                const currentTab = getInstanceById(vditorElement.getAttribute("data-id")) as Tab;
                const filePath = (currentTab.model as Editor).path;
                const wnd = (currentTab.parent as Wnd).split("lr");
                const tab = new Tab({
                    title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg><span>${escapeHtml(path.posix.basename(filePath))}</span>`,
                    callback(tab: Tab) {
                        tab.addModel(new Graph({
                            tab,
                            url: (currentTab.model as Editor).url,
                            path: filePath,
                            nodeId: itemTarget.getAttribute("data-node-id")
                        }));
                    }
                });
                wnd.addTab(tab);
            }
        }
    }));
    return menu;
};
