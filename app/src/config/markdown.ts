import {i18n} from '../i18n';
import {Constants} from '../constants';

export const markdown = {
    genHTML: (liandi: ILiandi) => {
        return `
<div class="form__item">
    ${i18n[liandi.config.lang].editMode}<span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="wysiwyg" type="radio" name="editMode"${liandi.config.markdown.editorMode === 'wysiwyg' ? ' checked' : ''}/>
        <span class="fn__space"></span>${i18n[liandi.config.lang].wysiwyg}
    </label>
    <span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="ir" name="editMode" type="radio"${liandi.config.markdown.editorMode === 'ir' ? ' checked' : ''}/>
        <span class="fn__space"></span>${i18n[liandi.config.lang].ir}
    </label>
    <span class="fn__space"></span><span class="fn__space"></span>
    <label>
        <input value="sv" name="editMode" type="radio"${liandi.config.markdown.editorMode === 'sv' ? ' checked' : ''}/>
        <span class="fn__space"></span>${i18n[liandi.config.lang].sv}
    </label>
</div>
<div class="form__item"><label>
    <input id="autoSpace" type="checkbox"${liandi.config.markdown.autoSpace ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].autoSpace}
</label></div>
<div class="form__item"><label>
    <input id="outline" type="checkbox"${liandi.config.markdown.outline ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].outline}
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
</div>
<div class="form__item"><label>
    <input id="hideToolbar" type="checkbox"${liandi.config.markdown.hideToolbar ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].hideToolbar}
</label></div>
<div class="form__item"><label>
    <input id="toc" type="checkbox"${liandi.config.markdown.toc ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].toc}
</label></div>
<div class="form__item"><label>
    <input id="footnotes" type="checkbox"${liandi.config.markdown.footnotes ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].footnotes}
</label></div>
<div class="form__item"><label>
    <input id="setext" type="checkbox"${liandi.config.markdown.setext ? ' checked' : ''}/>
    <span class="fn__space"></span>${i18n[liandi.config.lang].setext}
</label></div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelectorAll('input').forEach((item) => {
            item.addEventListener('change', (event) => {
                liandi.ws.send('setmd', {
                    autoSpace: (element.querySelector('#autoSpace') as HTMLInputElement).checked,
                    chinesePunct: (element.querySelector('#chinesePunct') as HTMLInputElement).checked,
                    fixTermTypo: (element.querySelector('#fixTermTypo') as HTMLInputElement).checked,
                    inlineMathAllowDigitAfterOpenMarker: (element.querySelector('#inlineMathAllowDigitAfterOpenMarker') as HTMLInputElement).checked,
                    editorMode: (element.querySelector('[name="editMode"]:checked') as HTMLInputElement).value,
                    mathEngine: (element.querySelector('[name="mathEngine"]:checked') as HTMLInputElement).value,
                    footnotes: (element.querySelector('#footnotes') as HTMLInputElement).checked,
                    toc: (element.querySelector('#toc') as HTMLInputElement).checked,
                    hideToolbar: (element.querySelector('#hideToolbar') as HTMLInputElement).checked,
                    setext: (element.querySelector('#setext') as HTMLInputElement).checked,
                    outline: (element.querySelector('#outline') as HTMLInputElement).checked,
                });
            });
        });
    },
    onSetmd: (liandi: ILiandi, md: IMD) => {
        liandi.config.markdown = md;
        liandi.editors.sendMessage(Constants.LIANDI_EDITOR_RELOAD, liandi);
    }
};
