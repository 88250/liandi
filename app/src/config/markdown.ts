import {i18n} from "../i18n";

export const markdown = {
    genHTML: (liandi: ILiandi) => {
        return `
<div class="form__item"><label><input type="checkbox" checked/><span class="fn__space"></span>${i18n[liandi.config.lang].autoSpace}</label></div>
<div class="form__item"><label><input type="checkbox" checked/><span class="fn__space"></span>${i18n[liandi.config.lang].fixTermTypo}</label></div>
<div class="form__item"><label><input type="checkbox" checked/><span class="fn__space"></span>${i18n[liandi.config.lang].chinesePunctuation}</label></div>
<div class="form__item"><label><input type="checkbox"/><span class="fn__space"></span>${i18n[liandi.config.lang].inlineMathDigit}</label></div>
<div class="form__item">
    ${i18n[liandi.config.lang].mathEngine}<span class="fn__space"></span><span class="fn__space"></span>
    <label><input name="math" type="radio"/><span class="fn__space"></span>MathJax</label>
    <span class="fn__space"></span><span class="fn__space"></span>
    <label><input type="radio" name="math" checked/><span class="fn__space"></span>KaTex</label>
</div>
<div class="form__item ft__secondary ft__smaller">${i18n[liandi.config.lang].needReopenEditor}</div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('select').addEventListener('change', (event) => {
            liandi.ws.send('settheme', {
                theme: (event.target as HTMLSelectElement).value
            });
        });
    },
    onSettheme: (liandi: ILiandi, themeName: 'white' | 'dark') => {
        liandi.config.theme = themeName;
        if (themeName === 'dark') {
            document.body.classList.add('theme--dark');
            if (liandi.editors.vditor) {
                liandi.editors.vditor.setTheme('dark');
            }
        } else {
            document.body.classList.remove('theme--dark');
            if (liandi.editors.vditor) {
                liandi.editors.vditor.setTheme('classic');
            }
        }
    }
};
