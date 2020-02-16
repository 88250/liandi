import {i18n} from '../i18n';
import {Constants} from "../constants";

export const markdown = {
    genHTML: (liandi: ILiandi) => {
        return `
<div class="form__item"><label>
    <input id="autoSpace" type="checkbox"${liandi.config.markdown.autoSpace ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].autoSpace}
</label></div>
<div class="form__item"><label>
    <input id="fixTermTypo" type="checkbox"${liandi.config.markdown.fixTermTypo ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].fixTermTypo}
</label></div>
<div class="form__item">
    <label><input id="chinesePunct" type="checkbox"${liandi.config.markdown.chinesePunct ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].chinesePunctuation}
</label></div>
<div class="form__item"><label>
    <input id="inlineMathAllowDigitAfterOpenMarker" type="checkbox"${liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].inlineMathDigit}
</label></div>
<div class="form__item">
    ${i18n[liandi.config.lang].mathEngine}<span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="KaTeX" type="radio" name="mathEngine"${liandi.config.markdown.mathEngine === 'KaTeX' ? ' checked' : ''}/>
        <span class="fn__space"></span>KaTeX
    </label>
    <span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="MathJax" name="mathEngine" type="radio"${liandi.config.markdown.mathEngine === 'MathJax' ? ' checked' : ''}/>
        <span class="fn__space"></span>MathJax
    </label>
</div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelectorAll('input').forEach((item) => {
            item.addEventListener('change', (event) => {
                liandi.ws.send('setmd', {
                    autoSpace: (element.querySelector('#autoSpace') as HTMLInputElement).checked,
                    chinesePunct: (element.querySelector('#chinesePunct') as HTMLInputElement).checked,
                    fixTermTypo: (element.querySelector('#fixTermTypo') as HTMLInputElement).checked,
                    inlineMathAllowDigitAfterOpenMarker: (element.querySelector('#inlineMathAllowDigitAfterOpenMarker') as HTMLInputElement).checked,
                    mathEngine: (element.querySelector('[name="mathEngine"]:checked') as HTMLInputElement).value,
                    footnotes: false,
                    toc: false,
                });
            });
        });
    },
    onSetmd: (liandi: ILiandi, md: IMD) => {
        liandi.config.markdown = md;
        liandi.editors.sendMessage(Constants.LIANDI_EDITOR_RELOAD);
    }
};
