import * as path from "path";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";
import {hasClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getAllModels, getInstanceById} from "../layout/util";


export const openFile = (url: string, filePath: string) => {
    let wnd: Wnd = undefined;
    if (getSelection().rangeCount > 0) {
        const range = getSelection().getRangeAt(0);
        const element = hasClosestByAttribute(range.startContainer, "data-type", "wnd", true);
        if (element && window.liandi.centerLayout.element.contains(element)) {
            wnd = getInstanceById(element.getAttribute("data-id")) as Wnd;
            const tab = wnd.children.find((item) => {
                if (item.model instanceof Editor) {
                    return true;
                }
            });
            if (!tab) {
                wnd = undefined;
            }
        }
    }
    if (!wnd) {
        const editorModels = getAllModels().editor;
        if (editorModels.length > 0) {
            wnd = editorModels[editorModels.length - 1].parent.parent;
        }
    }
    if (!wnd) {
        wnd = window.liandi.centerLayout.children[0] as Wnd;
    }

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
