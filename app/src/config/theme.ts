import {i18n} from '../i18n';

export const theme = {
    genHTML: (liandi: ILiandi) => {
        return `<select class="input">
    <option value="light" ${liandi.config.theme === 'light' ? 'selected' : ''}>${i18n[liandi.config.lang].themeLight}</option>
    <option value="dark" ${liandi.config.theme === 'dark' ? 'selected' : ''}>${i18n[liandi.config.lang].themeDark}</option>
</select>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('select').addEventListener('change', (event) => {
            liandi.ws.send('settheme', {
                theme: (event.target as HTMLSelectElement).value
            });
        });
    }
};
