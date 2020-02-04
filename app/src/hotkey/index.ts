import {Constants} from '../constants';
import {initSearch} from '../search';

export const initGlobalKeyPress = (liandi: ILiandi) => {
    let lastKeypressTime = 0;

    window.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            let thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA) {
                thisKeypressTime = 0;
                initSearch(liandi);
            }
            lastKeypressTime = thisKeypressTime;
        }
    });
};
