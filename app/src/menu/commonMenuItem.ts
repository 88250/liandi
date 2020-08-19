import {remote, shell} from "electron";
import {i18n} from "../i18n";
import * as path from "path";
import {bindDialogInput, destroyDialog, dialog} from "../util/dialog";
import {rename, validateName} from "../util/rename";
import {escapeHtml} from "../util/escape";
import {newFile} from "../util/newFile";

export const showInFolder = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].showInFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (itemData.path.endsWith("/")) {
                shell.openItem(path.posix.join(itemData.path, itemData.path));
            } else {
                shell.showItemInFolder(path.posix.join(itemData.path, itemData.path + ".md.json"));
            }
        }
    });
};

export const newFileMenu = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].newFile,
        click: () => {
            newFile(liandi);
        }
    });
};

export const newFolderMenu = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].newFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[liandi.config.lang].newFolder,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
                width: 400
            });

            const dialogElement = document.querySelector("#dialog");
            const inputElement = dialogElement.querySelector(".input") as HTMLInputElement;
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                const name = inputElement.value;
                if (!validateName(liandi, name)) {
                    return false;
                }

                const currentNewPath = path.posix.join(itemData.path, name);
                liandi.ws.send("mkdir", {
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

export const deleteMenu = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].delete,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[liandi.config.lang].delete,
                content: `${i18n[liandi.config.lang].confirmDelete} <b>${escapeHtml(itemData.name)}</b>?
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
                width: 400
            });

            const dialogElement = document.querySelector("#dialog");
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                if (liandi.current.dir && liandi.current.dir.url === itemData.url && itemData.path === liandi.current.path) {
                    // liandi.editors.close(liandi);
                    liandi.current = {
                        path: "",
                    };
                }
                liandi.ws.send("remove", {
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

export const renameMenu = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].rename,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[liandi.config.lang].rename,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[liandi.config.lang].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
                width: 400
            });
            const dialogElement = document.querySelector("#dialog");
            const inputElement = dialogElement.querySelector(".input") as HTMLInputElement;
            inputElement.value = itemData.name;
            dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
                destroyDialog();
            });
            dialogElement.querySelector(".button").addEventListener("click", () => {
                rename(liandi, inputElement.value, itemData.url, itemData.path);
            });
            bindDialogInput(inputElement, () => {
                (dialogElement.querySelector(".button") as HTMLButtonElement).click();
            });
        }
    });
};
