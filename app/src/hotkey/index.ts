import {Constants} from '../constants';
import {initSearch} from '../search';
import {isCtrl} from "../util/compatibility";

export const initGlobalKeyPress = (liandi: ILiandi) => {
    let lastKeypressTime = 0;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            let thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA) {
                thisKeypressTime = 0;
                initSearch(liandi);
            }
            lastKeypressTime = thisKeypressTime;
        }

        if (isCtrl(event) && event.key === 's') {
            liandi.editors.saveContent(liandi);
        }
    });
};
