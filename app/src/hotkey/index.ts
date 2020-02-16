import {Constants} from '../constants';
import {initSearch} from '../search';
import {isCtrl} from '../util/compatibility';

export const initGlobalKeyPress = (liandi: ILiandi) => {
    let lastKeypressTime = 0;

    window.addEventListener('keydown', (event) => {
        // 快捷搜素
        if (event.key === 'Shift') {
            let thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA) {
                thisKeypressTime = 0;
                initSearch(liandi);
            }
            lastKeypressTime = thisKeypressTime;
        }

        // 文件保存
        if (isCtrl(event) && event.key === 's') {
            liandi.editors.saveContent(liandi);
        }

        // 搜索
        if (isCtrl(event) && event.key === 'f') {
            liandi.find.open();
        }
    });
};
