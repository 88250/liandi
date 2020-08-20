import * as path from "path";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";

export const openFile = (wnd: Wnd, url: string, filePath: string) => {
    if (wnd) {
        wnd.addTab(new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconMD"></use></svg><span>${escapeHtml(path.posix.basename(filePath))}</span>`,
            callback(tab) {
                const editor = new Editor({
                    tab,
                    url,
                    path: filePath
                });
                tab.addModel(editor);
            }
        }));
    }
};
