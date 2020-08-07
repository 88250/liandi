import {remote} from 'electron';
import {i18n} from '../i18n';
import {bindDialogInput, destroyDialog, dialog} from '../util/dialog';
import {rename} from '../util/rename';
import {deleteMenu, newFile, newFolder, renameMenu, showInFolder} from './commonMenuItem';

export const initFolderMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(newFile(liandi));
    menu.append(newFolder(liandi));
    menu.append(deleteMenu(liandi));

    menu.append(renameMenu(liandi));

    menu.append(showInFolder(liandi));
    return menu;
};


export const initFileMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(deleteMenu(liandi));

    menu.append(renameMenu(liandi));

    menu.append(showInFolder(liandi));
    return menu;
};
