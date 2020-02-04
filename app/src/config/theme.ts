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
    onSettheme: (liandi: ILiandi, theme: 'white' | 'dark') => {
        liandi.config.theme = theme
        if (theme === 'dark') {
            document.body.classList.add('theme--dark')
            liandi.editors.vditor.setTheme('dark')
        } else {
            document.body.classList.remove('theme--dark')
            liandi.editors.vditor.setTheme('classic')
        }
    }
};
