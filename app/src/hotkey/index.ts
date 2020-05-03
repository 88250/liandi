import {Constants} from '../constants';
import {ipcRenderer} from 'electron';
import {initSearch} from '../search';

export const initGlobalKeyPress = (liandi: ILiandi | any) => {
    let lastKeypressTime = 0;
    let timeoutId = 0;
    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        if (event.key === 'Shift') {
            const thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA
                && thisKeypressTime - lastKeypressTime >= 50) { // 防止 win32 长按
                lastKeypressTime = 0;
                timeoutId = window.setTimeout(() => {
                    if (liandi.range) {
                        liandi.range = getSelection().getRangeAt(0);
                        ipcRenderer.sendToHost(Constants.LIANDI_SEARCH_OPEN);
                    } else {
                        initSearch(liandi);
                    }
                }, 200)
            }
            lastKeypressTime = thisKeypressTime;
        } else {
            lastKeypressTime = 0;
            clearTimeout(timeoutId);
        }
    });
};
