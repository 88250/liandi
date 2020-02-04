import {destroyDialog, dialog} from "../util/dialog";
import {i18n} from "../i18n";
import {rename} from "../util/rename";

export const initLauguage = (liandi: ILiandi) => {
    dialog({
        title: i18n[liandi.config.lang].language,
        content: `<select class="input"></select>
<div class="fn__hr"></div>
<div class="fn__flex"><div class="fn__flex-1"></div>
<button class="button button--confirm">${i18n[liandi.config.lang].save}</button><div class="fn__space"></div>
<button class="button button--cancel">${i18n[liandi.config.lang].cancel}</button></div>`,
        width: 400
    });
    const dialogElement = document.querySelector('#dialog');
    (dialogElement.querySelector('.input') as HTMLElement).focus()
    dialogElement.querySelector('.button--cancel').addEventListener('click', () => {
        destroyDialog();
    });
    dialogElement.querySelector('.button--confirm').addEventListener('click', () => {

    });
}
