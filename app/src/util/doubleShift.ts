import {initSearch} from '../search';
import {Constants} from "../constants";

export const doubleShift = () => {
    let lastKeypressTime = 0;
    let timeoutId = 0;
    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        if (event.key === 'Shift' && event.isComposing === false) {
            const thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA
                && thisKeypressTime - lastKeypressTime >= 50) { // 防止 win32 长按
                lastKeypressTime = 0;
                // shift + shift + c
                timeoutId = window.setTimeout(() => {
                    initSearch();
                }, 200);
            }
            lastKeypressTime = thisKeypressTime;
        } else {
            lastKeypressTime = 0;
            clearTimeout(timeoutId);
        }
    });
};
