import {bindDialogInput, destroyDialog, dialog} from "./dialog";
import {i18n} from "../i18n";
import {validateName} from "./rename";
import * as path from 'path';
import {Constants} from "../constants";

export const newFile = (liandi: ILiandi, callback = "") => {
    if (callback === Constants.CB_CREATE_INSERT) {
        const itemDataPath = path.posix.dirname(liandi.current.path)
        liandi.menus.itemData = {
            target: liandi.navigation.element.querySelector(`ul[data-url="${encodeURIComponent(liandi.current.dir.url)}"] li[data-path="${encodeURIComponent(itemDataPath + '/')}"]`),
            dir: {url: liandi.current.dir.url},
            path: itemDataPath,
        };
    }
    const itemData = liandi.menus.itemData;
    dialog({
        title: i18n[liandi.config.lang].newFile,
        content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button">${i18n[liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
        width: 400
    });

    const dialogElement = document.querySelector('#dialog');
    const inputElement = dialogElement.querySelector('.input') as HTMLInputElement;
    dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
        destroyDialog();
    });
    dialogElement.querySelector('.button').addEventListener('click', () => {
        const name = inputElement.value;
        if (!validateName(liandi, name)) {
            return false;
        }
        const currentNewPath = path.posix.join(itemData.path, name);
        liandi.ws.send('create', {
            url: itemData.dir.url,
            path: currentNewPath,
            callback
        });
    });
    bindDialogInput(inputElement, () => {
        (dialogElement.querySelector('.button') as HTMLButtonElement).click();
    });
}
