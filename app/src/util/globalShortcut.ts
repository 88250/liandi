import {initSearch} from "../search";
import {Constants} from "../constants";
import {isCtrl} from "../../vditore/src/ts/util/compatibility";

export const globalShortcut = () => {
    let lastKeypressTime = 0;
    let timeoutId = 0;
    window.addEventListener("keyup", () => {
        window.liandi.ctrlIsPressed = true;
    });
    window.addEventListener("keydown", (event) => {
        if (isCtrl(event)) {
            window.liandi.ctrlIsPressed = true;
        }

        // 快捷搜素
        if (event.key === "Shift" && event.isComposing === false) {
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
