import {i18n} from "../i18n";

export const image = {
    genHTML: (liandi: ILiandi) => {
        return `<div class="form__item"><label>
    <input id="autoFetch" type="checkbox"${liandi.config.image.autoFetch ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].autoFetch}
</label></div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelectorAll("input").forEach((item) => {
            item.addEventListener("change", () => {
                liandi.ws.send("setimage", {
                    autoFetch: (element.querySelector("#autoFetch") as HTMLInputElement).checked,
                });
            });
        });
    },
    onSetImage: (liandi: ILiandi, imageConfig: IImage) => {
        liandi.config.image = imageConfig;
    }
};
