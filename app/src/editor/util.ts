import * as path from "path";
import {Tab} from "../layout/Tab";
import {escapeHtml} from "../util/escape";
import {Editor} from "./index";
import {Wnd} from "../layout/Wnd";
import {hasClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getAllModels, getInstanceById} from "../layout/util";
import {Layout} from "../layout";
import {getEditorRange, setSelectionFocus} from "../../vditore/src/ts/util/selection";
import {expandMarker} from "../../vditore/src/ts/ir/expandMarker";
import {bgFade} from "../util/bgFade";

export const getIconByType = (type: string) => {
    let iconName = "";
    switch (type) {
        case "NodeDocument":
            iconName = "iconMD";
            break;
        case "NodeParagraph":
            iconName = "iconParagraph";
            break;
        case "NodeHeading":
            iconName = "vditor-icon-headings";
            break;
        case "NodeBlockquote":
            iconName = "vditor-icon-quote";
            break;
        case "NodeList":
            iconName = "vditor-icon-list";
            break;
        case "NodeCodeBlock":
        case "NodeHTMLBlock":
            iconName = "vditor-icon-code";
            break;
        case "NodeTable":
            iconName = "vditor-icon-table";
            break;
        case "NodeMathBlock":
            iconName = "iconMath";
            break;
    }
    return iconName;
};

export const openFile = (url: string, filePath: string, id?: string) => {
    const editor = getAllModels().editor.find((item) => {
        if (item.url === url && item.path == filePath) {
            item.parent.parent.switchTab(item.parent.headElement);
            if (id) {
                const vditorElement = item.vditore.vditor.ir.element;
                const nodeElement = vditorElement.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
                if (nodeElement) {
                    const range = getEditorRange(vditorElement);
                    range.selectNodeContents(nodeElement.firstChild);
                    range.collapse(true);
                    expandMarker(range, item.vditore.vditor);
                    setSelectionFocus(range);
                    vditorElement.scrollTop = nodeElement.offsetTop - vditorElement.clientHeight / 2;
                    bgFade(nodeElement);
                }
            }
            return true;
        }
    });
    if (editor) {
        return;
    }

    let wnd: Wnd = undefined;
    if (getSelection().rangeCount > 0) {
        const range = getSelection().getRangeAt(0);
        const element = hasClosestByAttribute(range.startContainer, "data-type", "wnd", true);
        if (element && window.liandi.centerLayout.element.contains(element)) {
            wnd = getInstanceById(element.getAttribute("data-id")) as Wnd;
        }
    }
    if (!wnd) {
        const editorModels = getAllModels().editor;
        if (editorModels.length > 0) {
            wnd = editorModels[editorModels.length - 1].parent.parent;
        }
    }
    if (!wnd) {
        const getWnd = (layout: Layout) => {
            for (let i = 0; i < layout.children.length; i++) {
                const item = layout.children[i];
                if (item instanceof Tab) {
                    wnd = item.parent;
                    break;
                } else {
                    getWnd(item as Layout);
                }
            }
        };
        getWnd(window.liandi.centerLayout);
    }

    if (wnd) {
        wnd.addTab(new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconMD"></use></svg><span>${escapeHtml(path.posix.basename(filePath))}</span>`,
            callback(tab) {
                const editor = new Editor({
                    tab,
                    url,
                    nodeId: id,
                    path: filePath
                });
                tab.addModel(editor);
            }
        }));
    }
};
