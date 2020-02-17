import {i18n} from '../i18n';
const packageJSON = require('../../package.json')

export const about = {
    genHTML: (liandi: ILiandi) => {
        return `<div class="about">
<div class="about__item fn__flex">
    <img src="../public/icon.ico" class="about__logo">
    <h1 class="fn__flex-center">${i18n[liandi.config.lang].slogan}</h1>
</div>
<div class="about__item">
    <button class="button">${i18n[liandi.config.lang].checkUpdate}</button>
    <div class="fn__hr fn__hr--s"></div>
    <div>
        <div id="configAboutUpdateTip"></div>
        <div class="ft__secondary ft__smaller">当前版本 ${packageJSON.version}</div>
    </div>
</div>
<div class="about__item ft__secondary ft__smaller">
    ${i18n[liandi.config.lang].title}<br>
    版权所有 2020 <a href="https://b3log.org">b3log.org</a>. 保留所有权利。<br>
    ${i18n[liandi.config.lang].title} 的诞生离不开 
    <a href="https://github.com/88250/liandi">${i18n[liandi.config.lang].title}</a> 
    开源项目以及其他<a href="https://github.com/vanessa219/vditor">开源软件</a>。
</div>
</div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('button').addEventListener('click', event => {
            liandi.ws.send('checkupdate', {});
        });
    },
    onCheckUpdate: (liandi: ILiandi, result: any) => {
        const outputSpan = document.querySelector('#configAboutUpdateTip');
        if (!result.data) {
            outputSpan.innerHTML = i18n[liandi.config.lang].alreadyLatestVer;
            return;
        }
        let msg = i18n[liandi.config.lang].latestVerIs;
        msg = msg.replace('{ver}', result.data.ver).replace('{dl}', result.data.dl);
        outputSpan.innerHTML = msg;
        return;
    }
};
