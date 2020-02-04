import {remote} from 'electron';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {destroyDialog, dialog} from '../util/dialog';
import {rename} from '../util/rename';
import {newFile, newFolder, showInFolder} from './commonMenuItem';

export const initFilesMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();

    menu.append(newFile(liandi));

    menu.append(newFolder(liandi));

    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].delete,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[liandi.config.lang].delete,
                content: `${i18n[liandi.config.lang].confirmDelete} <b>${itemData.name}</b>?
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[liandi.config.lang].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
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
                if (liandi.current.dir.url === itemData.url && itemData.path === liandi.current.path) {
                    liandi.editors.element.innerHTML = '';
                    liandi.current.path = '';
                }
                destroyDialog();
            });
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].rename,
        click: () => {
            const itemData = liandi.menus.itemData;
            dialog({
                title: i18n[liandi.config.lang].rename,
                content: `<input class="input" value="${itemData.name}">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[liandi.config.lang].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
                width: 400
            });
            const dialogElement = document.querySelector('#dialog');
            (dialogElement.querySelector('.input') as HTMLElement).focus()
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog();
            });
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                const newPath = rename(liandi, (dialogElement.querySelector('.input') as HTMLInputElement).value,
                    itemData.url, itemData.path);

                if (newPath) {
                    destroyDialog();
                }
            });
        }
    }));

    menu.append(showInFolder(liandi));
    return menu;
};


export const initFilesSpaceMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();

    menu.append(newFile(liandi));

    menu.append(newFolder(liandi));
    return menu;
};
