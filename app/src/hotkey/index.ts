import {Constants} from '../constants';
import {initSearch} from '../search';

export const initGlobalKeyPress = (liandi: ILiandi) => {
    let lastKeypressTime = 0;
    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        console.log(event)
        if (event.key === 'Shift' && event.isComposing === false) {
            const thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA
                && thisKeypressTime - lastKeypressTime >= 50) { // 防止 win32 长按
                lastKeypressTime = 0;
                initSearch(liandi);
            }
            lastKeypressTime = thisKeypressTime;
        } else {
            lastKeypressTime = 0;
        }
    });
};
