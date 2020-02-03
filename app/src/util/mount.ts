import {remote} from 'electron';
import {homedir} from 'os';
import {Constants} from '../constants';
import {destroyDialog, dialog} from './dialog';
import {i18n} from '../i18n';
import {showMessage} from "./message";

export const mountFile = async (liandi: ILiandi) => {
    const filePath = await remote.dialog.showOpenDialog({
        defaultPath: homedir(),
        properties: ['openDirectory', 'openFile'],
    });
    if (filePath.filePaths.length === 0) {
        return;
    }
    liandi.ws.send('mount', {
        url: `${Constants.WEBDAV_ADDRESS}/`,
        path: filePath.filePaths[0]
    });
};


export const mountWebDAV = (liandi: ILiandi) => {
    dialog({
        title: i18n[Constants.LANG].mountWebDAV,
        content: `<input placeholder="URL" class="input">
<div class="fn__hr"></div>
<input placeholder="${i18n[Constants.LANG].userName}" class="input">
<div class="fn__hr"></div>
<input placeholder="${i18n[Constants.LANG].password}" type="password" class="input">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
        width: 400,
        destroyDialogCallback: () => {
            if (liandi.navigation.element.querySelectorAll('tree-list').length === 0) {
                showMountDialog(liandi);
            }
        }
    });

    const dialogElement = document.querySelector('#dialog');
    dialogElement.querySelector('input').focus();
    dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
        if (liandi.navigation.element.querySelectorAll('tree-list').length === 0) {
            showMountDialog(liandi);
        } else {
            destroyDialog();
        }
    });
    dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
        const inputs = dialogElement.querySelectorAll('input');
        if (!inputs[0].value.startsWith('http')) {
            showMessage(i18n[Constants.LANG].urlError)
            return
        }
        liandi.ws.send('mountremote', {
            url: inputs[0].value,
            user: inputs[1].value,
            password: inputs[2].value,
        });
    });
};

export const showMountDialog = (liandi: ILiandi) => {
    dialog({
        title: i18n[Constants.LANG].slogan,
        content: `<div class="list--signal"><div class="list__item">${i18n[Constants.LANG].mount}</div>
<div class="list__item">${i18n[Constants.LANG].mountWebDAV}</div></div>`,
        width: 400,
        destroyDialogCallback: () => {
            if (liandi.navigation.element.querySelectorAll('tree-list').length === 0) {
                showMountDialog(liandi);
            }
        }
    });

    const listElement = document.querySelectorAll('#dialog .list__item');
    listElement[0].addEventListener('click', () => {
        mountFile(liandi);
    });
    listElement[1].addEventListener('click', () => {
        mountWebDAV(liandi);
    });
};
