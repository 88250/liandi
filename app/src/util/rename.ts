import {hideMessage, showMessage} from "./message";
import {i18n} from "../i18n";

export const validateName = (name: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[window.liandi.config.lang].fileNameRule);
        return false;
    }
    return true;
};
