import {remote, shell} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import * as path from 'path';
import {showMessage} from '../util/message';
import {destroyDialog, dialog} from '../util/dialog';
import {validateName} from '../util/rename';
import {getPath, removeLastPath} from '../util/path';

export const showInFolder = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[Constants.LANG].showInFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (itemData.target && itemData.target.tagName === 'TREE-LIST') {
                const dir = JSON.parse(decodeURIComponent(itemData.target.getAttribute('dir')));
                if (dir.path) {
                    shell.showItemInFolder(dir.path);
                } else {
                    showMessage(dir.url);
                }
            } else {
                if (liandi.current.dir.path) {
                    shell.showItemInFolder(path.join(liandi.current.dir.path, itemData.path));
                } else {
                    showMessage(path.join(liandi.current.dir.url, itemData.path));
                }
            }
        }
    });
};

export const newFile = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[Constants.LANG].newFile,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[Constants.LANG].newFile,
                content: `<input class="input" value="">
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
                const name = (dialogElement.querySelector('.input') as HTMLInputElement).value;
                if (!validateName(name)) {
                    return false;
                }

                let currentNewPath = removeLastPath(itemData.path) + name;
                if (!itemData.target) {
                    currentNewPath = getPath(itemData.path) + name;
                }
                liandi.ws.send('create', {
                    url: itemData.url,
                    path: currentNewPath

                });
                destroyDialog();
            });
        }
    });
};


export const newFolder = (liandi: ILiandi) => {
    return new remote.MenuItem({
        label: i18n[Constants.LANG].newFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[Constants.LANG].newFolder,
                content: `<input class="input" value="">
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
                const name = (dialogElement.querySelector('.input') as HTMLInputElement).value;
                if (!validateName(name)) {
                    return false;
                }

                let currentNewPath = removeLastPath(itemData.path) + name + '/';
                if (!itemData.target) {
                    currentNewPath = getPath(itemData.path) + name + '/';
                }
                liandi.ws.send('mkdir', {
                    url: itemData.url,
                    path: currentNewPath
                });
                destroyDialog();
            });
        }
    });
};
