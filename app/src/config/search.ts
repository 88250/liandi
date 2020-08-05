import {destroyDialog} from '../util/dialog';
import {i18n} from '../i18n';

const getLang = (keys: string[]) => {
    const langArray: string[] = [];
    keys.forEach((key) => {
        langArray.push(i18n.zh_CN[key]);
        langArray.push(i18n.en_US[key]);
    });
    return langArray;
};
export const initConfigSearch = (liandi: ILiandi, element: HTMLElement) => {
    const configIndex = [
        ['markdown', 'katex', 'mathjax'].concat(getLang(['config', 'outline',
            'autoSpace', 'fixTermTypo', 'chinesePunctuation', 'inlineMathDigit', 'mathEngine', 'hideToolbar', 'toc',
            'footnotes', 'paragraphBeginningSpace'
        ])),
        getLang(['autoFetch', 'image']),
        getLang(['theme', 'themeLight', 'themeDark']),
        ['English', '简体中文'].concat(getLang(['language'])),
        getLang(['about', 'slogan', 'currentVer', 'checkUpdate']),
        getLang(['help', 'help1', 'help2', 'help3', 'help4', 'help5']),
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
            destroyDialog(() => {
                liandi.editors.focus();
            });
            event.preventDefault();
        }
    });
};
