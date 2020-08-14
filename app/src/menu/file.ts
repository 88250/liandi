import {remote} from 'electron';
import {deleteMenu, newFileMenu, newFolderMenu, renameMenu, showInFolder} from './commonMenuItem';

export const initFolderMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(newFileMenu(liandi));
    menu.append(newFolderMenu(liandi));
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
