import {i18n} from "../i18n";
import {remote} from "electron";
import {getInstanceById} from "../layout/util";
import {Tab} from "../layout/Tab";
import {Wnd} from "../layout/Wnd";
import {Graph} from "../graph";
import {Editor} from "../editor";
import {escapeHtml} from "../util/escape";
import * as path from "path";
import {copyBlockId, renameMenu, splitLRMenu, splitTBMenu} from "./commonMenuItem";
import {Outline} from "../outline";

export const initTabMenu = () => {
    const menu = new remote.Menu();
    menu.append(splitLRMenu());
    menu.append(splitTBMenu());
    return menu;
};

export const initEditorMenu = () => {
    const menu = new remote.Menu();
    menu.append(copyBlockId());
    menu.append(splitLRMenu());
    menu.append(splitTBMenu());
    menu.append(renameMenu());
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].graphView,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id");
            const currentTab = getInstanceById(id) as Tab;
            const filePath = (currentTab.model as Editor).path;
            const wnd = (currentTab.parent as Wnd).split("lr");
            const tab = new Tab({
                title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg> ${escapeHtml(path.posix.basename(filePath))}`,
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
        label: i18n[window.liandi.config.lang].outline,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id");
            const currentTab = getInstanceById(id) as Tab;
            const filePath = (currentTab.model as Editor).path;
            const newWnd = (currentTab.parent as Wnd).split("lr");
            const tab = new Tab({
                title: `<svg class="item__svg"><use xlink:href="#vditor-icon-align-center"></use></svg> ${escapeHtml(path.posix.basename(filePath))}`,
                callback(tab: Tab) {
                    tab.addModel(new Outline({
                        tab,
                        contentElement: (currentTab.model as Editor).vditore.vditor.ir.element,
                        path:filePath,
                        url:(currentTab.model as Editor).url
                    }));
                }
            });
            newWnd.addTab(tab);

            newWnd.element.classList.remove("fn__flex-1");
            newWnd.element.style.width = "200px";
            newWnd.element.after(currentTab.parent.element);
            newWnd.element.after(newWnd.element.previousElementSibling);
            newWnd.parent.children.find((item, index) => {
                if (item.id === newWnd.id) {
                    const temp = item;
                    newWnd.parent.children[index] = newWnd.parent.children[index - 1];
                    newWnd.parent.children[index - 1] = temp;
                    return true;
                }
            });
        }
    }));
    return menu;
};
