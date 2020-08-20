import {bindDialogInput, destroyDialog, dialog} from "./dialog";
import {i18n} from "../i18n";
import {validateName} from "./rename";
import * as path from "path";
import {Constants} from "../constants";

export const newFile = (callback = "") => {
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
        const itemData = window.liandi.menus.itemData;
        const currentNewPath = path.posix.join(itemData.path, name);
        if (callback === Constants.CB_CREATE_INSERT) {
            // model.send("create", {
            //     url: itemData.url,
            //     path: currentNewPath,
            //     callback
            // });
        } else {
            window.liandi.ws.send("create", {
                url: itemData.url,
                path: currentNewPath,
                callback
            });
        }
    });
    bindDialogInput(inputElement, () => {
        (dialogElement.querySelector(".button") as HTMLButtonElement).click();
    });
};
