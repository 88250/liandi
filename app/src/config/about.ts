import {i18n} from "../i18n";

export const about = {
    genHTML: (liandi: ILiandi) => {
        return `<button>${i18n[liandi.config.lang].checkUpdate}</button><span id="checkUpdateOutput"></span>`
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('button').addEventListener('click', event => {
            liandi.ws.send('checkupdate', {})
        });
    },
    onCheckUpdate: (result: any) => {
        console.log(result)
        const outputSpan = document.querySelector('#checkUpdateOutput')
        console.log(outputSpan)
        if (0 === result.code) {
            outputSpan.innerHTML = "已是最新版"
            return;
        }
        if (-1 === result.code) {
            outputSpan.innerHTML = "检查版本失败"
            return;
        }
        if (1 === result.code) {
            outputSpan.innerHTML = "最新版为 v" + result.ver + " 下载请看 "  + result.dl
            return;
        }
    }
};
