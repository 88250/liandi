import {destroyDialog} from '../util/dialog';
import {i18n} from '../i18n';

export const initConfigSearch = (liandi: ILiandi, element: HTMLElement) => {
    const configIndex = [
        ['markdown', i18n.zh_CN.config, i18n.en_US.config, i18n.en_US.autoSpace, i18n.zh_CN.autoSpace,
            i18n.en_US.fixTermTypo, i18n.zh_CN.fixTermTypo, i18n.en_US.chinesePunctuation,
            i18n.zh_CN.chinesePunctuation, i18n.en_US.inlineMathDigit, i18n.zh_CN.inlineMathDigit,
            i18n.en_US.mathEngine, i18n.zh_CN.mathEngine, 'katex', 'mathjax'],
        ['light', 'dark', 'theme', '主题'],
        ['zh_CN', 'en_US', 'language', '语言'],
        ['about', '关于', i18n.zh_CN.checkUpdate, i18n.en_US.checkUpdate]
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

        inputElement.focus();
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
    inputElement.addEventListener('keydown', (event) => {
        if (event.isComposing) {
            return;
        }
        if (event.key === 'Escape') {
            destroyDialog();
            event.preventDefault();
        }
    });
};
