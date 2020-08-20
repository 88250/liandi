import {remote, shell} from "electron";
import {i18n} from "../i18n";
import * as path from "path";
import {bindDialogInput, destroyDialog, dialog} from "../util/dialog";
import {validateName} from "../util/rename";
import {escapeHtml} from "../util/escape";
import {newFile} from "../util/newFile";
import {copyTab, getInstanceById} from "../layout/util";
import {Tab} from "../layout/Tab";
import {Editor} from "../editor";

export const showInFolder = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].showInFolder,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            let rootPath = ''
            window.liandi.config.boxes.find((item) => {
                if (item.url === itemData.url) {
                    rootPath = item.path
                    return true
                }
            })

            if (itemData.path.endsWith("/")) {
                shell.openItem(path.posix.join(rootPath, itemData.path));
            } else {
                shell.showItemInFolder(path.posix.join(rootPath, itemData.path + ".md.json"));
            }
        }
    });
};

export const newFileMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].newFile,
        click: () => {
            newFile();
        }
    });
};

export const newFolderMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].newFolder,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            dialog({
                title: i18n[window.liandi.config.lang].newFolder,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[window.liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[window.liandi.config.lang].cancel}</button></div>`,
                width: 400
            });

            const dialogElement = document.querySelector("#dialog");
            const inputElement = dialogElement.querySelector(".input") as HTMLInputElement;
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                const name = inputElement.value;
                if (!validateName(name)) {
                    return false;
                }

                const currentNewPath = path.posix.join(itemData.path, name);
                window.liandi.ws.send("mkdir", {
                    url: itemData.url,
                    path: currentNewPath,
                    pushMode: 0
                });
            });
            bindDialogInput(inputElement, () => {
                (dialogElement.querySelector(".button") as HTMLButtonElement).click();
            });
        }
    });
};

export const deleteMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].delete,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            dialog({
                title: i18n[window.liandi.config.lang].delete,
                content: `${i18n[window.liandi.config.lang].confirmDelete} <b>${escapeHtml(itemData.name)}</b>?
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[window.liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[window.liandi.config.lang].cancel}</button></div>`,
                width: 400
            });

            const dialogElement = document.querySelector("#dialog");
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                window.liandi.ws.send("remove", {
                    url: itemData.url,
                    path: itemData.path,
                    pushMode: 0
                });
            });
        }
    });
};

export const renameMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].rename,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            dialog({
                title: i18n[window.liandi.config.lang].rename,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[window.liandi.config.lang].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[window.liandi.config.lang].cancel}</button></div>`,
                width: 400
            });
            const dialogElement = document.querySelector("#dialog");
            const inputElement = dialogElement.querySelector(".input") as HTMLInputElement;
            inputElement.value = itemData.name;
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                if (!validateName(inputElement.value)) {
                    return false;
                }
                if (!itemData.url) {
                    const tab = getInstanceById(itemData.target.getAttribute("data-id")) as Tab
                    itemData.url = (tab.model as Editor).url
                    itemData.path = (tab.model as Editor).path
                }
                const oldName = path.posix.basename(itemData.path);
                if (inputElement.value === oldName) {
                    destroyDialog();
                    return false;
                }

                const newPath = path.posix.join(path.posix.dirname(itemData.path), inputElement.value) + (itemData.path.endsWith("/") ? "/" : "");
                window.liandi.ws.send("rename", {
                    url: itemData.url,
                    oldPath: itemData.path,
                    newPath,
                    pushMode: 0
                });
                return newPath;
            });
            bindDialogInput(inputElement, () => {
                (dialogElement.querySelector(".button") as HTMLButtonElement).click();
            });
        }
    });
};

export const splitLRMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitLR,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id");
            const currentTab = getInstanceById(id) as Tab;
            currentTab.parent.spilt("lr").addTab(copyTab(currentTab));
        }
    });
};

export const splitTBMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitTB,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id");
            const currentTab = getInstanceById(id) as Tab;
            currentTab.parent.spilt("tb").addTab(copyTab(currentTab));
        }
    });
};
