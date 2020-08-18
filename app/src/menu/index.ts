import {initFolderMenu, initFileMenu} from "./file";
import {initNavigationMenu} from "./navigation";
import {initMountMenu} from "./mount";
import {hasTopClosestByTag} from "../../vditore/src/ts/util/hasClosest";
import {initVditorMenu} from "./vditor";
import {clipboard} from "electron";
import {initBacklinksMenu} from "./backlinks";

export class Menus {
    public itemData: IMenuData;

    constructor(liandi: ILiandi) {

        window.addEventListener("contextmenu", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector("body"))) {
                const dataType = target.getAttribute("data-type");
                if (target.classList.contains("navigation")) {
                    // navigation 空白：挂载目录/挂载 DAV
                    initMountMenu(liandi).popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-root") {
                    // navigation 根上：新建文档/文件夹/取消挂在/打开文件位置
                    this.itemData = {
                        target,
                        path: "/",
                        dir: this.getDir(target),
                    };
                    initNavigationMenu(liandi).popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-folder") {
                    // navigation 文件夹上：新建文档/文件夹/删除/重命名/打开文件位置
                    this.itemData = {
                        target,
                        dir: this.getDir(target),
                        path: decodeURIComponent(target.getAttribute("data-path")),
                        name: decodeURIComponent(target.getAttribute("data-name")),
                    };
                    initFolderMenu(liandi).popup();
                    event.preventDefault();
                    break;
                }

                if (dataType === "navigation-file") {
                    // navigation 文件上：删除/重命名/打开文件位置
                    this.itemData = {
                        target,
                        dir: this.getDir(target),
                        path: decodeURIComponent(target.getAttribute("data-path")),
                        name: decodeURIComponent(target.getAttribute("data-name")),
                    };
                    initFileMenu(liandi).popup();
                    event.preventDefault();
                    break;
                }

                if (target.classList.contains("vditor-ir")) {
                    // 编辑器上：粘贴为纯文本
                    const vditorMenu = initVditorMenu(liandi);
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
                        dir: {url: target.getAttribute("data-url")},
                    };
                    initBacklinksMenu(liandi).popup();
                    event.preventDefault();
                    break;
                }

                target = target.parentElement;
            }
        }, false);
    }

    private getDir(target: HTMLElement) {
        const rootElement = hasTopClosestByTag(target, "UL");
        if (rootElement) {
            return JSON.parse(decodeURIComponent(rootElement.getAttribute("data-dir")));
        }
    }
}
