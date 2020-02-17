import {Constants} from '../constants';

export const theme = {
    genHTML: (liandi: ILiandi) => {
        return `<select class="input">
    <option value="white" ${liandi.config.theme === 'white' ? 'selected' : ''}>White</option>
    <option value="dark" ${liandi.config.theme === 'dark' ? 'selected' : ''}>Dark</option>
</select>`;
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
            if (liandi.editors.isOpen) {
                liandi.editors.sendMessage(Constants.LIANDI_EDITOR_SETTHEME, liandi);
            }
        } else {
            document.body.classList.remove('theme--dark');
            if (liandi.editors.isOpen) {
                liandi.editors.sendMessage(Constants.LIANDI_EDITOR_SETTHEME, liandi);
            }
        }
    }
};
