import {hideMessage, showMessage} from "./message";
import {i18n} from "../i18n";
import {Constants} from "../constants";

export const rename = (name: string, url: string, oldPath: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[Constants.LANG].fileNameRule)
        return false;
    }
    let oldPathList = oldPath.split('/')
    let oldName = ''
    if (oldPath.endsWith('/')) {
        oldName = oldPathList[oldPathList.length - 2]
    } else {
        oldName = oldPathList[oldPathList.length - 1]
    }

    if (name === oldName) {
        return false;
    }

    const newPath = oldPath.replace(oldName + (oldPath.endsWith('/') ? '/' : ''), '') + name
        + (oldPath.endsWith('/') ? '/' : '')
    window.liandi.liandi.ws.webSocket.send(JSON.stringify({
        cmd: 'rename',
        param: {
            url,
            oldPath,
            newPath
        },
    }));
    return newPath
}
