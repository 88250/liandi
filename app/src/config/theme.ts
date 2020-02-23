import {Constants} from '../constants';
import {i18n} from '../i18n';
import {ipcRenderer} from 'electron';

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
    },
    onSettheme: (liandi: ILiandi, themeName: 'light' | 'dark') => {
        liandi.config.theme = themeName;
        ipcRenderer.send(Constants.LIANDI_CONFIG_THEME, themeName);
        if (themeName === 'dark') {
            document.body.classList.add('theme--dark');
            liandi.editors.sendMessage(Constants.LIANDI_EDITOR_OPEN, liandi);
        } else {
            document.body.classList.remove('theme--dark');
            liandi.editors.sendMessage(Constants.LIANDI_EDITOR_OPEN, liandi);
        }
    }
};
