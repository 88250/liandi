import {remote} from "electron";
import {copyBlockId, deleteMenu, newFileMenu, newFolderMenu, renameMenu, showInFolder} from "./commonMenuItem";

export const initFolderMenu = () => {
    const menu = new remote.Menu();
    menu.append(newFileMenu());
    menu.append(newFolderMenu());
    menu.append(deleteMenu());
    menu.append(renameMenu());
    menu.append(showInFolder());
    return menu;
};


export const initFileMenu = () => {
    const menu = new remote.Menu();
    menu.append(renameMenu());
    menu.append(deleteMenu());
    menu.append(showInFolder());
    return menu;
};
