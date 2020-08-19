import {i18n} from "../i18n";
import {mountFile, mountWebDAV} from "../util/mount";
import {remote} from "electron";

export const initTabMenu = () => {
    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitLR,
        click: async () => {
            mountFile();
        }
    }));
    menu.append(new remote.MenuItem({
        label: i18n[window.liandi.config.lang].splitTB,
        click: async () => {
            mountWebDAV();
        }
    }));
    return menu;
}
