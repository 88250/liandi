export const theme = {
    genHTML: (liandi: ILiandi) => {
        return `<select class="input">
    <option value="en_US" ${liandi.config.theme === 'white' ? 'selected' : ''}>White</option>
    <option value="zh_CN" ${liandi.config.theme === 'dark' ? 'selected' : ''}>Dark</option>
</select>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('select').addEventListener('change' , (event) => {
            liandi.ws.send('settheme', {
                theme: (event.target as HTMLSelectElement).value
            });
        });
    },
    onSettheme: () => {

    }
};
