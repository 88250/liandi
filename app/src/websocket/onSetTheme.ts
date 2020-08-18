import {Constants} from "../constants";
import { ipcRenderer } from "electron";

export const onSetTheme = (theme:TTheme) => {
    window.liandi.config.theme = theme;
    ipcRenderer.send(Constants.LIANDI_CONFIG_THEME, theme);
    if (theme === "dark") {
        document.body.classList.add("theme--dark");
    } else {
        document.body.classList.remove("theme--dark");
    }
    // TODO
    // this.editors.forEach((item) => {
    //     if (item.vditor) {
    //         item.vditor.setTheme(liandi.config.theme === 'dark' ? 'dark' : 'classic', liandi.config.theme)
    //     }
    // })
};
