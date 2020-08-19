import * as path from "path";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";

export const openFile = (url: string, filePath: string) => {
    if (window.liandi.centerLayout.children.length === 0) {
        // window.liandi.centerLayout.addWnd(new Wnd({
        //     title: "file"
        // }))
    } else {
        (window.liandi.centerLayout.children[0] as Wnd).addTab(new Tab({
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
};
