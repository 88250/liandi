import {hideMessage, showMessage} from "./message";
import {i18n} from "../i18n";
import * as path from "path";
import {destroyDialog} from "./dialog";

export const validateName = (name: string) => {
    hideMessage();

    if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
        showMessage(i18n[window.liandi.config.lang].fileNameRule);
        return false;
    }
    return true;
};

export const rename = (liandi: ILiandi, name: string, url: string, oldPath: string) => {
    if (!validateName(name)) {
        return false;
    }

    const oldName = path.posix.basename(oldPath);

    if (name === oldName) {
        destroyDialog();
        return false;
    }

    const newPath = path.posix.join(path.posix.dirname(oldPath), name) + (oldPath.endsWith("/") ? "/" : "");
    liandi.ws.send("rename", {
        url,
        oldPath,
        newPath
    });
    return newPath;
};
