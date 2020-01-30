import {remote} from "electron";
import {i18n} from "../i18n";
import {Constants} from "../constants";
import {destroyDialog, dialog} from "../util/dialog";
import {rename, validateName} from "../util/rename";
import {removeLastPath} from "../util/path";

export const initFilesMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu()

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].newFile,
        click: () => {
            const target = liandi.menus.itemData.target;
            dialog({
                title: i18n[Constants.LANG].newFile,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                width: 400
            })

            const dialogElement = document.querySelector('#dialog')
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog()
            })
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                const name = (dialogElement.querySelector('.input') as HTMLInputElement).value
                if (!validateName(name)) {
                    return false
                }
                liandi.ws.webSocket.send(JSON.stringify({
                    cmd: 'create',
                    param: {
                        url: target.getAttribute('url'),
                        path: removeLastPath(target.getAttribute('path')) + name

                    },
                }));
                destroyDialog()
            })
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].newFolder,
        click: () => {
            const target = liandi.menus.itemData.target;
            dialog({
                title: i18n[Constants.LANG].newFolder,
                content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                width: 400
            })

            const dialogElement = document.querySelector('#dialog')
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog()
            })
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                const name = (dialogElement.querySelector('.input') as HTMLInputElement).value
                if (!validateName(name)) {
                    return false
                }
                liandi.ws.webSocket.send(JSON.stringify({
                    cmd: 'mkdir',
                    param: {
                        url: target.getAttribute('url'),
                        path: removeLastPath(target.getAttribute('path')) + name + '/'

                    },
                }));
                destroyDialog()
            })
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].delete,
        click: () => {
            const target = liandi.menus.itemData.target;
            dialog({
                title: i18n[Constants.LANG].delete,
                content: `${i18n[Constants.LANG].confirmDelete} <b>${target.getAttribute('name')}</b>?
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].confirm}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                width: 400
            })

            const dialogElement = document.querySelector('#dialog')
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog()
            })
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                liandi.ws.webSocket.send(JSON.stringify({
                    cmd: 'remove',
                    param: {
                        url: target.getAttribute('url'),
                        path: target.getAttribute('path')

                    },
                }));
                destroyDialog()
            })
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[Constants.LANG].rename,
        click: () => {
            const target = liandi.menus.itemData.target;
            dialog({
                title: i18n[Constants.LANG].rename,
                content: `<input class="input" value="${target.getAttribute('name')}">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[Constants.LANG].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[Constants.LANG].cancel}</button></div>`,
                width: 400
            })
            const dialogElement = document.querySelector('#dialog')
            dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
                destroyDialog()
            })
            dialogElement.querySelector('.button--confirm').addEventListener('click', () => {
                const newPath = rename((dialogElement.querySelector('.input') as HTMLInputElement).value,
                    target.getAttribute('url'), target.getAttribute('path'))

                if (newPath) {
                    destroyDialog()
                }
            })
        }
    }));
    return menu
}
