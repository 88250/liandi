import {i18n} from "../i18n";
import {remote} from "electron";
import {getTabById} from "../layout/util";
import {Tab} from "../layout/Tab";
import {Wnd} from "../layout/wnd";
import {Graph} from "../graph";
import {Backlinks} from "../backlinks";
import {Editor} from "../editor";
import {escapeHtml} from "../util/escape";
import * as path from "path";
import {splitLRMenu, splitTBMenu} from "./commonMenuItem";

export const initTabMenu = () => {
    const menu = new remote.Menu();
    menu.append(splitLRMenu());
    menu.append(splitTBMenu());
    return menu;
};

export const initEditorMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].rename,
        click: async () => {
            // TODO
        }
    }));
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].backlinks,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getTabById(id) as Tab;
            const filePath = (currentTab.model as Editor).path
            const newWnd = (currentTab.parent as Wnd).spilt("lr")
            const tab = new Tab({
                title: `<svg class="item__svg"><use xlink:href="#iconLink"></use></svg> ${escapeHtml(path.posix.basename(filePath))}`,
                callback(tab: Tab) {
                    tab.addModel(new Backlinks({
                        tab,
                        url: (currentTab.model as Editor).url,
                        path: filePath
                    }));
                }
            });
            newWnd.addTab(tab);
        }
    }));
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].graphView,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getTabById(id) as Tab;
            const filePath = (currentTab.model as Editor).path
            const wnd = (currentTab.parent as Wnd).spilt("lr")
            const tab = new Tab({
                title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg> ${escapeHtml(path.posix.basename(filePath))}`,
                panel: '<div class="graph__input"><input class="input"></div><div class="fn__flex-1"></div>',
                callback(tab: Tab) {
                    tab.addModel(new Graph({
                        tab,
                        url: (currentTab.model as Editor).url,
                        path: filePath
                    }));
                }
            });
            wnd.addTab(tab);
        }
    }));
    menu.append(splitLRMenu());
    menu.append(splitTBMenu());
    return menu;
};
