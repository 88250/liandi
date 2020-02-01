import {remote, shell} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {destroyDialog, dialog} from '../util/dialog';
import {rename, validateName} from '../util/rename';
import {getPath, removeLastPath} from '../util/path';
import * as path from "path";

export const initFilesMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();

    menu.append(new remote.MenuItem({
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

                let path = removeLastPath(itemData.path) + name;
                if (!itemData.target) {
                    path = getPath(itemData.path) + name;
                }
                liandi.ws.send('create', {
                    url: itemData.url,
                    path

                });
                destroyDialog();
            });
        }
    }));

    menu.append(new remote.MenuItem({
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

                let path = removeLastPath(itemData.path) + name + '/';
                if (!itemData.target) {
                    path = getPath(itemData.path) + name + '/';
                }
                liandi.ws.send('mkdir', {
                    url: itemData.url,
                    path
                });
                destroyDialog();
            });
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].delete,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[Constants.LANG].delete,
                content: `${i18n[Constants.LANG].confirmDelete} <b>${itemData.name}</b>?
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
                liandi.ws.send('remove',{
                        url: itemData.url,
                        path: itemData.path
                    });
                if (liandi.current.url === itemData.url && itemData.path === liandi.current.path) {
                    liandi.editors.element.innerHTML = '';
                    liandi.current.path = '';
                }
                destroyDialog();
            });
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].rename,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[Constants.LANG].rename,
                content: `<input class="input" value="${itemData.name}">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                width: 400
            });
            const dialogElement = document.querySelector('#dialog');
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog();
            });
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                const newPath = rename((dialogElement.querySelector('.input') as HTMLInputElement).value,
                    itemData.url, itemData.path);

                if (newPath) {
                    destroyDialog();
                }
            });
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].showInFolder,
        click: () => {
            const itemData = liandi.menus.itemData;
            shell.showItemInFolder(path.join(itemData.url, itemData.path))
        }
    }));
    return menu;
};
