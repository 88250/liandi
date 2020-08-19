import * as path from "path";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";
import {getCurrentWnd, getInstanceById} from "../layout/util";

export const openFile = (url: string, filePath: string) => {
    const currentWnd = getCurrentWnd();
    if (currentWnd) {
        const wnd = getInstanceById(currentWnd.getAttribute("data-id"))
        if (wnd) {
            (wnd as Wnd).addTab(new Tab({
                title: `<svg class="item__svg"><use xlink:href="#iconMD"></use></svg>${escapeHtml(path.posix.basename(filePath))}`,
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
    }
};
