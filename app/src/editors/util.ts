import * as path from "path";
import {Layout} from "../layout";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";

export const openFile = (url: string, filePath: string) => {
    const centerLayout = (window.liandi.layout.children[1] as Layout).children[1] as Layout;
    if (centerLayout.children.length === 0) {
        // centerLayout.addWnd(new Wnd({
        //     title: "file"
        // }))
    } else {
        (centerLayout.children[0] as Wnd).addTab(new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconMD"></use></svg>${escapeHtml(path.posix.basename(filePath))}`,
            callback(tab) {
                const editor = new Editor({
                    tab,
                    url,
                    path: filePath
                });
                tab.addModel(editor)
            }
        }));
    }
};
