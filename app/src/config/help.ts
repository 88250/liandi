import {i18n} from '../i18n';

export const help = {
    genHTML: (liandi: ILiandi) => {
        return `<ul class="help">
        <li><a class="fn__a" href="https://hacpai.com/article/1583308420519">${i18n[liandi.config.lang].help1}</a></li>
        <li><a class="fn__a" href="https://hacpai.com/article/1583129520165">${i18n[liandi.config.lang].help2}</a></li>
        <li><a class="fn__a" href="https://hacpai.com/article/1583305480675">${i18n[liandi.config.lang].help3}</a></li>
        <li><a class="fn__a" href="https://hacpai.com/tag/liandi-biji">${i18n[liandi.config.lang].help4}</a></li>
        <li><a class="fn__a" href="https://github.com/88250/liandi/issues">${i18n[liandi.config.lang].help5}</a></li>
    </ul>`;
    },
};
