import {Constants} from '../constants';
import {ipcRenderer} from 'electron';
import {initSearch} from '../search';

export const initGlobalKeyPress = (liandi?: ILiandi) => {
    let lastKeypressTime = 0;

    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        if (event.key === 'Shift') {
            const thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA
                && thisKeypressTime - lastKeypressTime >= 50) { // 防止 win32 长按
                lastKeypressTime = 0;
                if (liandi) {
                    initSearch(liandi);
                } else {
                    ipcRenderer.sendToHost(Constants.LIANDI_SEARCH_OPEN);
                }
            }
            lastKeypressTime = thisKeypressTime;
        }
    });
};
