import {i18n} from "../i18n";
import {mountFile, mountWebDAV} from "../util/mount";
import {remote} from "electron";
import {copyTab, getTabById} from "../layout/util";
import {Tab} from "../layout/Tab";
import {Wnd} from "../layout/wnd";
import {Graph} from "../graph";
import {Backlinks} from "../backlinks";
import {Editor} from "../editor";
import {escapeHtml} from "../util/escape";
import * as path from "path";

export const initTabMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitLR,
        click: async () => {
            mountFile();
        }
    }));
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitTB,
        click: async () => {
            mountWebDAV();
        }
    }));
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
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitLR,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getTabById(id) as Tab;
            currentTab.parent.spilt("lr").addTab(copyTab(currentTab));
        }
    }));
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitTB,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getTabById(id) as Tab;
            currentTab.parent.spilt("tb").addTab(copyTab(currentTab));
        }
    }));
    return menu;
};
