import {i18n} from '../i18n';
import {VDITOR_VERSION} from '../../vditore/src/ts/constants';

export const about = {
    genHTML: (liandi: ILiandi) => {
        return `<div class="about">
<div class="about__item fn__flex">
    <img src="../public/icon.png" class="about__logo">
    <strong class="fn__flex-center">${i18n[liandi.config.lang].slogan}</strong>
</div>
<div class="about__item">
    <div>${i18n[liandi.config.lang].currentVer} v${VDITOR_VERSION}</div>
    <div class="fn__hr--s"></div>
    <button class="button">${i18n[liandi.config.lang].checkUpdate}</button>
</div>
<div class="about__item ft__secondary ft__smaller">
    Copyright (c) 2020-present, <a href="https://b3log.org">b3log.org</a><br><br>
    LianDi is licensed under Mulan PSL v2.<br>
    You can use this software according to the terms and conditions of the Mulan PSL v2.<br>
    You may obtain a copy of Mulan PSL v2 at:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http://license.coscl.org.cn/MulanPSL2<br>
    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.<br>
    See the Mulan PSL v2 for more details.
</div>
</div>`;
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('button').addEventListener('click', event => {
            liandi.ws.send('checkupdate', {});
        });
    },
};
