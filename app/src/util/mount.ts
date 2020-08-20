import {remote} from "electron";
import {homedir} from "os";
import {Constants} from "../constants";
import {destroyDialog, dialog} from "./dialog";
import {i18n} from "../i18n";
import {showMessage} from "./message";
import {getAllModels} from "../layout/util";

export const mountFile = async () => {
    const filePath = await remote.dialog.showOpenDialog({
        defaultPath: homedir(),
        properties: ["openDirectory", "openFile"],
    });
    if (filePath.filePaths.length === 0) {
        return;
    }
    if (getAllModels().files.length === 0) {
        document.getElementById("barNavigation").dispatchEvent(new CustomEvent("click"));
    }
    window.liandi.ws.send("mount", {
        url: `${Constants.WEBDAV_ADDRESS}/`,
        path: filePath.filePaths[0],
        pushMode: 0
    });
};


export const mountWebDAV = () => {
    const liandi = window.liandi;
    dialog({
        title: i18n[liandi.config.lang].mountWebDAV,
        content: `<input placeholder="URL" class="input">
<div class="fn__hr"></div>
<input placeholder="${i18n[liandi.config.lang].userName}" class="input">
<div class="fn__hr"></div>
<input placeholder="${i18n[liandi.config.lang].password}" type="password" class="input">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
        width: 400
    });

    const dialogElement = document.querySelector("#dialog");
    dialogElement.querySelector("input").focus();
    dialogElement.querySelector(".button--cancel").addEventListener("click", () => {
        destroyDialog();
    });
    dialogElement.querySelector(".button").addEventListener("click", () => {
        const inputs = dialogElement.querySelectorAll("input");
        if (!inputs[0].value.startsWith("http")) {
            showMessage(i18n[liandi.config.lang].urlError);
            return;
        }
        if (getAllModels().files.length === 0) {
            document.getElementById("barNavigation").dispatchEvent(new CustomEvent("click"));
        }
        liandi.ws.send("mountremote", {
            url: inputs[0].value,
            user: inputs[1].value,
            password: inputs[2].value,
            pushMode: 0
        });
    });
};

