import {Constants} from '../constants';
import {ipcRenderer} from 'electron';

export const initGlobalKeyPress = (liandi: ILiandi) => {
    let lastKeypressTime = 0;

    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        if (event.key === 'Shift') {
            let thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA) {
                thisKeypressTime = 0;
                ipcRenderer.send(Constants.LIANDI_SEARCH_OPEN);
            }
            lastKeypressTime = thisKeypressTime;
        }
    });
};
