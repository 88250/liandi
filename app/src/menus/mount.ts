import {remote} from "electron";
import {i18n} from "../i18n";
import {mountFile, mountWebDAV} from "../util/mount";

export const initMountMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].mount,
        click: async () => {
            mountFile();
        }
    }));

    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].mountWebDAV,
        click: async () => {
            mountWebDAV();
        }
    }));
    return menu;
};
