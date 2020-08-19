import {remote} from "electron";
import {i18n} from "../i18n";
import {newFileMenu, newFolderMenu, showInFolder} from "./commonMenuItem";

export const initNavigationMenu = (liandi: ILiandi) => {
    const menu = new remote.Menu();
    menu.append(newFileMenu(liandi));
    menu.append(newFolderMenu(liandi));
    menu.append(new remote.MenuItem({
        label: i18n[liandi.config.lang].unMount,
        click: () => {
            const itemData = liandi.menus.itemData;
            if (liandi.current.dir && liandi.current.dir.url === itemData.url) {
                // liandi.editors.close(liandi);
                liandi.current = {
                    path: "",
                };
            }
            liandi.ws.send("unmount", {
                url: itemData.url
            });
            itemData.target.parentElement.remove();
            // liandi.graph.render(liandi);
        }
    }));
    menu.append(showInFolder(liandi));
    return menu;
};
