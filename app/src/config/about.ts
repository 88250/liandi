import {i18n} from '../i18n';

export const about = {
    genHTML: (liandi: ILiandi) => {
        return `<button>${i18n[liandi.config.lang].checkUpdate}</button><span id="checkUpdateOutput"></span>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('button').addEventListener('click', event => {
            liandi.ws.send('checkupdate', {});
        });
    },
    onCheckUpdate: (liandi: ILiandi, result: any) => {
        console.log(result);
        const outputSpan = document.querySelector('#checkUpdateOutput');
        if (0 === result.code) {
            outputSpan.innerHTML = i18n[liandi.config.lang].alreadyLatestVer;
            return;
        }
        if (-1 === result.code) {
            outputSpan.innerHTML = i18n[liandi.config.lang].checkUpdateErr;
            return;
        }
        if (1 === result.code) {
            let msg = i18n[liandi.config.lang].latestVerIs;
            msg = msg.replace('{ver}', result.data.ver).replace('{dl', result.data.dl);
            outputSpan.innerHTML = msg;
            return;
        }
    }
};
