import {remote, shell} from 'electron';
import {i18n} from '../i18n';
import * as path from 'path';
import {bindDialogInput, destroyDialog, dialog} from '../util/dialog';
import {validateName} from '../util/rename';

export const showInFolder = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].showInFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (itemData.path.endsWith("/")) {
                shell.openItem(path.join(itemData.dir.path, itemData.path));
            } else {
                shell.showItemInFolder(path.join(itemData.dir.path, itemData.path));
            }
        }
    });
};

export const newFile = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[liandi.config.lang].newFile,
        click: () => {
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
                let currentNewPath = path.join(path.dirname(itemData.path), name);
                liandi.ws.send('create', {
                    url: itemData.dir.url,
                    path: currentNewPath
                });
                destroyDialog();
            });
            bindDialogInput(inputElement, () => {
                (dialogElement.querySelector('.button') as HTMLButtonElement).click();
            });
        }
    });
};


export const newFolder = (liandi: ILiandi) => {
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

                let currentNewPath = path.join(path.dirname(itemData.path), name);
                liandi.ws.send('mkdir', {
                    url: itemData.dir.url,
                    path: currentNewPath
                });
                destroyDialog();
            });
            bindDialogInput(inputElement, () => {
                (dialogElement.querySelector('.button') as HTMLButtonElement).click();
            });
        }
    });
};
