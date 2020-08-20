import {i18n} from "../i18n";

export const image = {
    genHTML: () => {
        return `<div class="form__item"><label>
    <input id="autoFetch" type="checkbox"${window.liandi.config.image.autoFetch ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].autoFetch}
</label></div>`;
    },
    bindEvent: (element: HTMLElement) => {
        element.querySelectorAll("input").forEach((item) => {
            item.addEventListener("change", () => {
                window.liandi.ws.send("setimage", {
                    autoFetch: (element.querySelector("#autoFetch") as HTMLInputElement).checked,
                });
            });
        });
    },
    onSetImage: (imageConfig: {autoFetch: boolean}) => {
        window.liandi.config.image = imageConfig;
    }
};
