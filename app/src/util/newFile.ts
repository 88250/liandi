import {bindDialogInput, destroyDialog, dialog} from "./dialog";
import {i18n} from "../i18n";
import {validateName} from "./rename";
import * as path from "path";
import {Editor} from "../editor";
import {getAllModels} from "../layout/util";

export const newFile = (editor?: Editor, callback?:string) => {
    dialog({
        title: i18n[window.liandi.config.lang].newFile,
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
        if (editor) {
            editor.send("create", {
                url: editor.url,
                path: path.posix.join(path.posix.dirname(editor.path), name),
                callback,
                pushMode:0
            });
        } else {
            const itemData = window.liandi.menus.itemData;
            const currentNewPath = path.posix.join(itemData.path, name);
            window.liandi.ws.send("create", {
                url: itemData.url,
                path: currentNewPath,
                pushMode:0
            })
        }
    });
    bindDialogInput(inputElement, () => {
        (dialogElement.querySelector(".button") as HTMLButtonElement).click();
    });
};
