export const initConfigSearch = (liandi: ILiandi, element: HTMLElement) => {
    const configIndex = [
        ['markdown'],
        ['white', 'dark', 'theme', '主题'],
        ['zh_CN', 'en_US', 'language', '语言']
    ];
    const inputElement = element.querySelector('.input') as HTMLInputElement;
    const updateTab = () => {
        const indexList: number[] = [];
        const inputValue = inputElement.value;
        configIndex.map((item, index) => {
            item.map(subItem => {
                if (inputValue.toLowerCase().indexOf(subItem) > -1 || subItem.toLowerCase().indexOf(inputValue) > -1) {
                    indexList.push(index);
                }
            });
        });

        let currentTabElement: HTMLElement;
        element.querySelectorAll('.tab--vertical li').forEach((item: HTMLElement, index) => {
            if (indexList.includes(index)) {
                if (!currentTabElement) {
                    currentTabElement = item;
                }
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        const tabPanelElement = element.querySelector('tab-panel') as HTMLElement;
        if (currentTabElement) {
            tabPanelElement.style.display = 'block';
            currentTabElement.click();
        } else {
            tabPanelElement.style.display = 'none';
        }
    };

    inputElement.addEventListener('compositionend', () => {
        updateTab();
    });
    inputElement.addEventListener('input', (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }
        updateTab();
    });
};
