import {hideMessage, showMessage} from './message';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {destroyDialog} from "./dialog";

export const validateName = (name: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[Constants.LANG].fileNameRule);
        return false;
    }
    return true;
};

export const rename = (name: string, url: string, oldPath: string) => {
    if (!validateName(name)) {
        return false;
    }

    const oldPathList = oldPath.split('/');
    let oldName = '';
    if (oldPath.endsWith('/')) {
        oldName = oldPathList[oldPathList.length - 2];
    } else {
        oldName = oldPathList[oldPathList.length - 1];
    }

    if (name === oldName) {
        destroyDialog()
        return false;
    }

    const newPath = oldPath.replace(oldName + (oldPath.endsWith('/') ? '/' : ''), '') + name
        + (oldPath.endsWith('/') ? '/' : '');
    window.liandi.liandi.ws.send('rename', {
            url,
            oldPath,
            newPath
        }, true);
    return newPath;
};
