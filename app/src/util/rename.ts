import {hideMessage, showMessage} from './message';
import {i18n} from '../i18n';
import * as path from 'path';
import {destroyDialog} from './dialog';

export const validateName = (liandi: ILiandi, name: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[liandi.config.lang].fileNameRule);
        return false;
    }
    return true;
};

export const rename = (liandi: ILiandi, name: string, url: string, oldPath: string) => {
    if (!validateName(liandi, name)) {
        return false;
    }

    const oldName = path.basename(oldPath);

    if (name === oldName) {
        destroyDialog();
        return false;
    }

    const newPath = path.join(path.dirname(oldPath), name) + (oldPath.endsWith('/') ? '/' : '');
    window.liandi.liandi.ws.send('rename', {
        url,
        oldPath,
        newPath
    }, true);
    return newPath;
};
