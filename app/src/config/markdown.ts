import {i18n} from "../i18n";
import {Tab} from "../layout/Tab";
import {Editor} from "../editor";
import {Layout} from "../layout";

export const markdown = {
    genHTML: () => {
        return `
<div class="form__item"><label>
    <input id="outline" type="checkbox"${window.liandi.config.markdown.outline ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].outline}
</label></div>
<div class="form__item"><label>
    <input id="autoSpace" type="checkbox"${window.liandi.config.markdown.autoSpace ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].autoSpace}
</label></div>
<div class="form__item"><label>
    <input id="fixTermTypo" type="checkbox"${window.liandi.config.markdown.fixTermTypo ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].fixTermTypo}
</label></div>
<div class="form__item">
    <label><input id="chinesePunct" type="checkbox"${window.liandi.config.markdown.chinesePunct ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].chinesePunctuation}
</label></div>
<div class="form__item"><label>
    <input id="paragraphBeginningSpace" type="checkbox"${window.liandi.config.markdown.paragraphBeginningSpace ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].paragraphBeginningSpace}
</label></div><div class="form__item"><label>
    <input id="inlineMathAllowDigitAfterOpenMarker" type="checkbox"${window.liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].inlineMathDigit}
</label></div>
<div class="form__item">
    ${i18n[window.liandi.config.lang].mathEngine}<span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="KaTeX" type="radio" name="mathEngine"${window.liandi.config.markdown.mathEngine === "KaTeX" ? " checked" : ""}/>
        <span class="fn__space"></span>KaTeX
    </label>
    <span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="MathJax" name="mathEngine" type="radio"${window.liandi.config.markdown.mathEngine === "MathJax" ? " checked" : ""}/>
        <span class="fn__space"></span>MathJax
    </label>
</div>
<div class="form__item"><label>
    <input id="hideToolbar" type="checkbox"${window.liandi.config.markdown.hideToolbar ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].hideToolbar}
</label></div>
<div class="form__item"><label>
    <input id="toc" type="checkbox"${window.liandi.config.markdown.toc ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].toc}
</label></div>
<div class="form__item"><label>
    <input id="footnotes" type="checkbox"${window.liandi.config.markdown.footnotes ? " checked" : ""}/>
    <span class="fn__space"></span>${i18n[window.liandi.config.lang].footnotes}
</label></div></div>
<div class="form__item"><label>
    <input id="mark" type="checkbox"${window.liandi.config.markdown.mark ? " checked" : ""}/>
    <span class="fn__space"></span>==${i18n[window.liandi.config.lang].mark}==
</label></div>`;
    },
    bindEvent: (element: HTMLElement) => {
        element.querySelectorAll("input").forEach((item) => {
            item.addEventListener("change", () => {
                window.liandi.ws.send("setmd", {
                    autoSpace: (element.querySelector("#autoSpace") as HTMLInputElement).checked,
                    chinesePunct: (element.querySelector("#chinesePunct") as HTMLInputElement).checked,
                    fixTermTypo: (element.querySelector("#fixTermTypo") as HTMLInputElement).checked,
                    paragraphBeginningSpace: (element.querySelector("#paragraphBeginningSpace") as HTMLInputElement).checked,
                    inlineMathAllowDigitAfterOpenMarker: (element.querySelector("#inlineMathAllowDigitAfterOpenMarker") as HTMLInputElement).checked,
                    mathEngine: (element.querySelector('[name="mathEngine"]:checked') as HTMLInputElement).value,
                    footnotes: (element.querySelector("#footnotes") as HTMLInputElement).checked,
                    toc: (element.querySelector("#toc") as HTMLInputElement).checked,
                    hideToolbar: (element.querySelector("#hideToolbar") as HTMLInputElement).checked,
                    outline: (element.querySelector("#outline") as HTMLInputElement).checked,
                    mark: (element.querySelector("#mark") as HTMLInputElement).checked,
                });
            });
        });
    },
    onSetMD: (md: IMD) => {
        window.liandi.config.markdown = md;

        const reloadAllVditor = (layout: Layout) => {
            for (let i = 0; i < layout.children.length; i++) {
                const item = layout.children[i];
                if (item instanceof Tab) {
                    const model = (item as Tab).model;
                    if (model instanceof Editor) {
                        model.reloadVditor();
                    }
                } else {
                    reloadAllVditor(item as Layout);
                }
            }
        };
        reloadAllVditor(window.liandi.layout);
    }
};
