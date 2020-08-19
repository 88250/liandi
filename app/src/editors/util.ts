import * as path from "path";
import {Layout} from "../layout";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";
import {Files} from "../files";
import {WebSocketUtil} from "../websocket";

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
                    element: tab.panelElement,
                    url,
                    path:filePath
                });
                tab.addModel(editor)
                editor.ws = new WebSocketUtil(editor, () => {
                    editor.ws.send("get", {
                        url,
                        path:filePath
                    });
                })
            }
        }));
    }
};
