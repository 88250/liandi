import {i18n} from "../i18n";

export const theme = {
    genHTML: () => {
        return `<select class="input">
    <option value="light" ${window.liandi.config.theme === "light" ? "selected" : ""}>${i18n[window.liandi.config.lang].themeLight}</option>
    <option value="dark" ${window.liandi.config.theme === "dark" ? "selected" : ""}>${i18n[window.liandi.config.lang].themeDark}</option>
</select>`;
    },
    bindEvent: (element: HTMLElement) => {
        element.querySelector("select").addEventListener("change", (event) => {
            window.liandi.ws.send("settheme", {
                theme: (event.target as HTMLSelectElement).value
            });
        });
    }
};
