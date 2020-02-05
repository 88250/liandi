export const initConfigSearch = (liandi: ILiandi, element: HTMLElement) => {
    const configIndex = [
        ["markdown"],
        ['white', 'dark', 'theme'],
        ['zh_CN', 'en_US', 'language']
    ]
    const inputElement = element.querySelector('.input') as HTMLInputElement
    const updateTab = () => {
        const tabElements = element.querySelectorAll('.tab--vertical li')
        let index = []
        const inputValue = inputElement.value
        configIndex.map((item, index) => {
            item.map(subItem => {
                // if ()
            })
        })

    }

    inputElement.addEventListener('compositionend', () => {
        updateTab()
    });
    inputElement.addEventListener('input', (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }
        updateTab()
    })
}
