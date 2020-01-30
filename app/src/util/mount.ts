import {remote} from "electron";
import {homedir} from "os";
import {Constants} from "../constants";
import {destroyDialog, dialog} from "./dialog";
import {i18n} from "../i18n";

export const mountFile = async (webSocket: WebSocket) => {
    const filePath = await remote.dialog.showOpenDialog({
        defaultPath: homedir(),
        properties: ['openDirectory', 'openFile'],
    });
    if (filePath.filePaths.length === 0) {
        return;
    }
    webSocket.send(JSON.stringify({
        cmd: 'mount',
        param: {
            url: `${Constants.WEBDAV_ADDRESS}/`,
            path: filePath.filePaths[0]
        }
    }));
}


export const mountWebDAV = (webSocket: WebSocket) => {
    dialog({
        title: i18n[Constants.LANG].mountWebDAV,
        content: `<input placeholder="https://dav.jianguoyun.com/dav/" class="input">
<div class="fn__hr"></div>
<input placeholder="user name" class="input">
<div class="fn__hr"></div>
<input placeholder="password" type="password" class="input">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
        width: 400
    });

    const dialogElement = document.querySelector('#dialog');
    dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
        destroyDialog();
    });
    dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
        const inputs = dialogElement.querySelectorAll("input")
        webSocket.send(JSON.stringify({
            cmd: 'mountremote',
            param: {
                url: inputs[0].value,
                user: inputs[1].value,
                password: inputs[2].value,
            }
        }));
    });

}
