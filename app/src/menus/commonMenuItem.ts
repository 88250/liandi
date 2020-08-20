import {remote, shell} from "electron";
import {i18n} from "../i18n";
import * as path from "path";
import {bindDialogInput, destroyDialog, dialog} from "../util/dialog";
import {rename, validateName} from "../util/rename";
import {escapeHtml} from "../util/escape";
import {newFile} from "../util/newFile";
import {copyTab, getInstanceById, removeEditorTab} from "../layout/util";
import {Tab} from "../layout/Tab";

export const showInFolder = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].showInFolder,
        click: () => {
            const itemData = window.liandi.menus.itemData;
            if (itemData.path.endsWith("/")) {
                shell.openItem(path.posix.join(itemData.path, itemData.path));
            } else {
                shell.showItemInFolder(path.posix.join(itemData.path, itemData.path + ".md.json"));
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
                    path: currentNewPath
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
                removeEditorTab(window.liandi.layout, itemData.url, itemData.path)
                window.liandi.ws.send("remove", {
                    url: itemData.url,
                    path: itemData.path
                });
                if (itemData.target.nextElementSibling?.tagName === "UL") {
                    itemData.target.nextElementSibling.remove();
                }
                itemData.target.remove();
                destroyDialog();
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
                rename(window.liandi, inputElement.value, itemData.url, itemData.path);
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
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getInstanceById(id) as Tab;
            currentTab.parent.spilt("lr").addTab(copyTab(currentTab));
        }
    });
}

export const splitTBMenu = () => {
    return new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitTB,
        click: async () => {
            const itemData = window.liandi.menus.itemData;
            const id = itemData.target.getAttribute("data-id")
            const currentTab = getInstanceById(id) as Tab;
            currentTab.parent.spilt("tb").addTab(copyTab(currentTab));
        }
    });
}
