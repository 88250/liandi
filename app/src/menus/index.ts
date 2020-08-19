import {initFolderMenu, initFileMenu} from "./file";
import {initNavigationMenu} from "./navigation";
import {initMountMenu} from "./mount";
import {hasTopClosestByTag} from "../../vditore/src/ts/util/hasClosest";
import {initVditorMenu} from "./vditor";
import {clipboard} from "electron";
import {initBacklinksMenu} from "./backlinks";
import {initEditorMenu, initTabMenu} from "./tab";

export class Menus {
    public itemData: IMenuData;

    constructor() {
        window.addEventListener("contextmenu", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector("body"))) {
                const dataType = target.getAttribute("data-type");

                if (dataType === "tab-header-editor") {
                    this.itemData = {
                        target,
                    };
                    initEditorMenu().popup();
                    event.preventDefault();
                    break;
                }
                if (dataType === "tab-header") {
                    this.itemData = {
                        target,
                    };
                    initTabMenu().popup();
                    event.preventDefault();
                    break;
                }

                if (target.classList.contains("navigation")) {
                    // navigation 空白：挂载目录/挂载 DAV
                    initMountMenu().popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-root") {
                    // navigation 根上：新建文档/文件夹/取消挂在/打开文件位置
                    this.itemData = {
                        target,
                        path: "/",
                        url: this.getUrl(target),
                    };
                    initNavigationMenu().popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-folder") {
                    // navigation 文件夹上：新建文档/文件夹/删除/重命名/打开文件位置
                    this.itemData = {
                        target,
                        url: this.getUrl(target),
                        path: decodeURIComponent(target.getAttribute("data-path")),
                        name: decodeURIComponent(target.getAttribute("data-name")),
                    };
                    initFolderMenu().popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-file") {
                    // navigation 文件上：删除/重命名/打开文件位置
                    this.itemData = {
                        target,
                        url: this.getUrl(target),
                        path: decodeURIComponent(target.getAttribute("data-path")),
                        name: decodeURIComponent(target.getAttribute("data-name")),
                    };
                    initFileMenu().popup();
                    event.preventDefault();
                    break;
                }

                if (target.classList.contains("vditor-ir")) {
                    // 编辑器上：粘贴为纯文本
                    const vditorMenu = initVditorMenu();
                    vditorMenu.getMenuItemById("pasteAsPlainText").enabled = clipboard.readText() !== "";
                    vditorMenu.popup();
                    event.preventDefault();
                    getSelection().getRangeAt(0).collapse(true);
                    break;
                }

                if (dataType === "backlinks-file") {
                    // backlinks：打开新窗口
                    this.itemData = {
                        target,
                        path: target.getAttribute("data-path"),
                        url: target.getAttribute("data-url"),
                    };
                    initBacklinksMenu().popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }

    private getUrl(target: HTMLElement) {
        const rootElement = hasTopClosestByTag(target, "UL");
        if (rootElement) {
            return decodeURIComponent(rootElement.getAttribute("data-url"));
        }
    }
}
