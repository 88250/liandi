import {Constants} from "../constants";
import { ipcRenderer } from "electron";
import {getAllModels} from "../layout/util";

export const onSetTheme = (theme:TTheme) => {
    window.liandi.config.theme = theme;
    ipcRenderer.send(Constants.LIANDI_CONFIG_THEME, theme);
    if (theme === "dark") {
        document.body.classList.add("theme--dark");
    } else {
        document.body.classList.remove("theme--dark");
    }
    getAllModels().editor.forEach((item) => {
        item.vditore.setTheme(theme === 'dark' ? 'dark' : 'classic', theme)
    })
};
