import {Constants} from "../constants";
import {dialog} from "../util/dialog";

export const initGlobalKeyPress = () => {
    let lastKeypressTime = 0;

    window.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            let thisKeypressTime = new Date().getTime();
            if (thisKeypressTime - lastKeypressTime <= Constants.DOUBLE_DELTA) {
                thisKeypressTime = 0;
                dialog({
                    content: `<input class="input" value="">
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>`,
                    width: 600
                })
            }
            lastKeypressTime = thisKeypressTime;
        }
    })
}
