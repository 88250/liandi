import {i18n} from "../i18n";

export const about = {
    genHTML: (liandi: ILiandi) => {
        return `<button id="checkUpdateBtn">${i18n[liandi.config.lang].checkUpdate}</button>`
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('button').addEventListener('click', event => {
            liandi.ws.send('checkupdate', {})
        });
    },
    onCheckUpdate: (data: any) => {
        console.log(data)
        if (0 === data.code) {
            return;
        }
        if (-1 === data.code) {
            // TODO: 报错提示
            return;
        }
        if (1 === data.code) {
            // 有更新
            return;
        }
    }
};
