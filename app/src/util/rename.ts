import {hideMessage, showMessage} from './message';
import {i18n} from '../i18n';
import {destroyDialog} from './dialog';

export const validateName = (liandi: ILiandi, name: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[liandi.config.lang].fileNameRule);
        return false;
    }
    return true;
};

export const rename = (liandi:ILiandi, name: string, url: string, oldPath: string) => {
    if (!validateName(liandi, name)) {
        return false;
    }

    if (!name.endsWith('.md')) {
        name += '.md';
    }

    const oldPathList = oldPath.split('/');
    let oldName = '';
    if (oldPath.endsWith('/')) {
        oldName = oldPathList[oldPathList.length - 2];
    } else {
        oldName = oldPathList[oldPathList.length - 1];
    }

    if (name === oldName) {
        destroyDialog();
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
