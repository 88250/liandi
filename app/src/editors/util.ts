import * as path from "path";
import {Layout} from "../layout";
import {Tabs} from "../layout/Tabs";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";

export const openFile = (url: string, filePath: string) => {
    const centerLayout = (window.liandi.layout.children[1] as Layout).children[1] as Layout;
    if (centerLayout.children.length === 0) {
        // centerLayout.addWnd(new Wnd({
        //     title: "file"
        // }))
    } else {
        (centerLayout.children[0].children as Tabs).addTab({
            title: `<svg><use xlink:href="#iconMD"></use></svg>${escapeHtml(path.posix.basename(filePath))}`,
            callback(panelElement) {
                const editor = new Editor(panelElement);
                editor.initVditor();
            }
        });
    }
};
