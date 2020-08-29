import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {getInstanceById, resizeTabs} from "./util";
import {Tab} from "./Tab";
import {Model} from "./Model";
import {Editor} from "../editor";
import {Graph} from "../graph";
import * as path from "path";
import {hasClosestByClassName} from "../../vditore/src/ts/util/hasClosest";
import {hasClosestByTag} from "../../vditore/src/ts/util/hasClosestByHeadings";
import {i18n} from "../i18n";
import {remote} from "electron";

export class Wnd {
    public id: string
    public parent?: Layout
    public element: HTMLElement
    public headersElement: HTMLElement
    public children: Tab[] = []
    public resize?: TDirection

    constructor(resize?: TDirection) {
        this.id = genUUID();
        this.resize = resize;
        this.element = document.createElement("div");
        this.element.classList.add("fn__flex-1", "fn__flex");
        this.element.innerHTML = `<div data-type="wnd" data-id="${this.id}" class="fn__flex-column fn__flex fn__flex-1">
    <ul class="fn__flex tab__headers"></ul>
    <div class="tab__panels fn__flex-1"><div class="tab__drag fn__none"></div></div>
</div>`;
        this.headersElement = this.element.querySelector(".tab__headers");
        this.headersElement.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.isEqualNode(this.headersElement)) {
                if (target.tagName === "LI") {
                    this.switchTab(target);
                    break;
                }
                target = target.parentElement;
            }
        });
        const dragElement = this.element.querySelector(".tab__drag") as HTMLElement;
        this.element.addEventListener("dragenter", (event: DragEvent & { target: HTMLElement }) => {
            if (event.dataTransfer.types.includes("application/liandi")) {
                const tabHeadersElement = hasClosestByClassName(event.target, "tab__headers");
                if (tabHeadersElement) {
                    return;
                }
                const tabPanelsElement = hasClosestByClassName(event.target, "tab__panels", true);
                if (tabPanelsElement) {
                    dragElement.classList.remove("fn__none");
                }
            }
        });
        const tabHeadersElement = this.element.querySelector(".tab__headers");
        tabHeadersElement.addEventListener("dragover", function (event: DragEvent & { target: HTMLElement }) {
            const it = this as HTMLElement;
            it.querySelectorAll("li").forEach((item) => {
                item.style.backgroundColor = "";
            });
            const newTabHeaderElement = hasClosestByTag(event.target, "LI");
            if (newTabHeaderElement && newTabHeaderElement.style.opacity !== "0.6") {
                newTabHeaderElement.style.backgroundColor = "rgba(102, 161, 204, 0.36)";
            }
            if (!newTabHeaderElement) {
                it.style.backgroundColor = "rgba(102, 161, 204, 0.36)";
            }
            event.preventDefault();
        });
        tabHeadersElement.addEventListener("dragleave", function () {
            const it = this as HTMLElement;
            it.querySelectorAll("li").forEach((item) => {
                item.style.backgroundColor = "";
            });
            it.style.backgroundColor = "";
        });
        tabHeadersElement.addEventListener("drop", function (event: DragEvent & { target: HTMLElement }) {
            const oldTab = getInstanceById(event.dataTransfer.getData("application/liandi")) as Tab;
            const it = this as HTMLElement;
            it.style.backgroundColor = "";
            const newTabHeaderElement = hasClosestByTag(event.target, "LI");
            // TODO 对象顺序
            if (!it.contains(oldTab.headElement)) {
                const newWnd = getInstanceById(it.parentElement.getAttribute("data-id")) as Wnd;
                newWnd.moveTab(oldTab);
                if (newTabHeaderElement) {
                    newTabHeaderElement.before(oldTab.headElement);
                    newTabHeaderElement.style.backgroundColor = "";
                }
                return;
            }
            if (!newTabHeaderElement) {
                return;
            }
            newTabHeaderElement.style.backgroundColor = "";
            if (newTabHeaderElement !== oldTab.panelElement) {
                const oldTabNextElement = oldTab.headElement.nextElementSibling;
                const oldTabPreviousElement = oldTab.headElement.previousElementSibling;
                if (!oldTabNextElement && oldTabPreviousElement === newTabHeaderElement) {
                    newTabHeaderElement.before(oldTab.headElement);
                    return;
                }
                newTabHeaderElement.after(oldTab.headElement);
                if (oldTabNextElement && oldTabNextElement !== newTabHeaderElement) {
                    oldTabNextElement.before(newTabHeaderElement);
                } else if (oldTabPreviousElement && oldTabPreviousElement !== newTabHeaderElement) {
                    oldTabPreviousElement.after(newTabHeaderElement);
                }
            }
        });
        // animationThrottle("dragover", "optimizedDragover", dragElement);
        dragElement.addEventListener("dragover", (event: DragEvent & { layerX: number, layerY: number }) => {
            event.preventDefault();
            // console.log(event.layerX, event.layerY);
        });
        dragElement.addEventListener("dragleave", () => {
            dragElement.classList.add("fn__none");
        });
        dragElement.addEventListener("drop", (event: DragEvent & { target: HTMLElement }) => {
            dragElement.classList.add("fn__none");
            const newWndElement = event.target.parentElement.parentElement;
            const tabId = event.dataTransfer.getData("application/liandi");
            if (newWndElement.contains(document.querySelector(`[data-id="${tabId}"]`))) {
                return;
            }
            const newWnd = getInstanceById(newWndElement.getAttribute("data-id")) as Wnd;
            const tab = getInstanceById(tabId) as Tab;
            if (newWnd) {
                newWnd.moveTab(tab);
            }
        });
    }

    public switchTab(target: HTMLElement) {
        let currentTab: Tab;
        this.children.forEach((item) => {
            if (target === item.headElement) {
                item.headElement?.classList.add("item--current");
                item.panelElement.classList.remove("fn__none");
                currentTab = item;
            } else {
                item.headElement?.classList.remove("item--current");
                item.panelElement.classList.add("fn__none");
            }
        });
        if (currentTab && target === currentTab.headElement && currentTab.model instanceof Graph) {
            currentTab.model.resize();
        }
    }

    public addTab(tab: Tab) {
        this.children.forEach((item) => {
            item.headElement?.classList.remove("item--current");
            item.panelElement.classList.add("fn__none");
        });
        this.children.push(tab);

        if (tab.headElement) {
            this.headersElement.append(tab.headElement);
            tab.headElement.querySelector(".item__svg--close").addEventListener("click", function (event) {
                const it = this as HTMLElement;
                const currentTab = getInstanceById(it.parentElement.getAttribute("data-id")) as Tab;
                currentTab.parent.removeTab(tab.id);
                event.stopPropagation();
                event.preventDefault();
            });
        }
        this.element.querySelector(".tab__panels").append(tab.panelElement);
        tab.parent = this;
        if (tab.callback) {
            tab.callback(tab);
        }
    }

    private destroyModel(model: Model) {
        if (model instanceof Editor) {
            model.vditore.destroy();
        }
        model.send("closews", {});
    }

    private confirmRemoveEditor(model: Model) {
        if (!(model instanceof Editor)) {
            return true;
        }
        if (!model.saved) {
            const confirmRst = confirm(path.posix.basename(model.path) + i18n[window.liandi.config.lang].saveTip);
            // 该解决方案会导致闪烁
            remote.getCurrentWindow().blur();
            remote.getCurrentWindow().focus();
            return confirmRst;
        }
        return true;
    }

    public removeTab(id: string) {
        if (this.children.length === 1) {
            if (!this.confirmRemoveEditor(this.children[0].model)) {
                return;
            }
            this.destroyModel(this.children[0].model);
            this.children = [];
            this.remove();
            return;
        }
        this.children.find((item, index) => {
            if (item.id === id) {
                if (!this.confirmRemoveEditor(item.model)) {
                    return true;
                }
                if (item.headElement.classList.contains("item--current")) {
                    let currentIndex = index + 1;
                    if (index === this.children.length - 1) {
                        currentIndex = index - 1;
                    }
                    this.switchTab(this.children[currentIndex].headElement);
                }
                item.headElement.remove();
                item.panelElement.remove();
                this.destroyModel(item.model);
                this.children.splice(index, 1);
                this.resetLayout(item.parent.parent);
                return true;
            }
        });
    }

    private moveTab(tab: Tab) {
        if (tab.headElement) {
            this.headersElement.append(tab.headElement);
        }
        this.element.querySelector(".tab__panels").append(tab.panelElement);
        this.children.push(tab);
        this.resetLayout(this.parent);
        this.switchTab(tab.headElement);

        const oldWnd = tab.parent;
        if (oldWnd.children.length === 1) {
            oldWnd.children = [];
            oldWnd.remove();
        } else {
            oldWnd.children.find((item, index) => {
                if (item.id === tab.id) {
                    oldWnd.children.splice(index, 1);
                    this.resetLayout(item.parent.parent);
                    return true;
                }
            });
            oldWnd.switchTab(oldWnd.children[oldWnd.children.length - 1].headElement);
        }

        tab.parent = this;

        resizeTabs();
    }

    public split(direction: TDirection) {
        const wnd = new Wnd(direction);
        if (direction === this.parent.direction) {
            this.parent.addWnd(wnd, this.id);
        } else {
            this.parent.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                    });
                    this.parent.addLayout(layout, item.id);
                    const movedWnd = this.parent.children.splice(index, 1)[0];
                    movedWnd.resize = undefined;
                    layout.addWnd.call(layout, movedWnd);
                    layout.addWnd.call(layout, wnd);

                    if (direction === "tb" && movedWnd.element.style.width) {
                        layout.element.style.width = movedWnd.element.style.width;
                        layout.element.classList.remove("fn__flex-1");
                        movedWnd.element.style.width = "";
                        movedWnd.element.classList.add("fn__flex-1");
                    } else if (direction === "lr" && movedWnd.element.style.height) {
                        layout.element.style.height = movedWnd.element.style.height;
                        layout.element.classList.remove("fn__flex-1");
                        movedWnd.element.style.height = "";
                        movedWnd.element.classList.add("fn__flex-1");
                    }
                    return true;
                }
            });
        }
        return wnd;
    }

    private remove() {
        let layout = this.parent;
        let id = this.id;
        let element = this.element;
        while (layout && layout.children.length === 1 && !["top", "bottom", "left", "right", "center"].includes(layout.type)) {
            id = layout.id;
            element = layout.element;
            layout = layout.parent;
        }

        layout.children.find((item, index) => {
            if (item.id === id) {
                if (layout.children.length > 1) {
                    let sideElement = layout.children[index - 1];
                    if (index === 0) {
                        sideElement = layout.children[1];
                    }
                    if (layout.direction === "lr") {
                        sideElement.element.style.width = (sideElement.element.clientWidth + element.clientWidth) + "px";
                    } else {
                        sideElement.element.style.height = (sideElement.element.clientHeight + element.clientHeight) + "px";
                    }
                }
                layout.children.splice(index, 1);
                return true;
            }
        });
        if (element.previousElementSibling && element.previousElementSibling.classList.contains("layout__resize")) {
            element.previousElementSibling.remove();
        } else if (element.nextElementSibling && element.nextElementSibling.classList.contains("layout__resize")) {
            element.nextElementSibling.remove();
        }
        element.remove();
        this.resetLayout(layout);
    }

    public resetLayout(layout: Layout) {
        if (layout.type === "center" || layout.type === "normal" || layout.children.length !== 1) {
            resizeTabs();
            return;
        }

        if (layout.children[0].children.length === 2) {
            if (layout.type === "left" && layout.element.clientWidth < 7) {
                window.liandi.centerLayout.element.style.width = (window.liandi.centerLayout.element.clientWidth - 200) + "px";
                layout.element.style.width = "206px";
            } else if (layout.type === "right" && layout.element.clientWidth < 7) {
                const rightWidth = window.innerWidth / 3;
                window.liandi.centerLayout.element.style.width = (window.liandi.centerLayout.element.clientWidth - rightWidth) + "px";
                window.liandi.rightLayoutWidth = rightWidth;
            } else if (layout.type === "top" && layout.element.clientHeight < 7) {
                window.liandi.centerLayout.parent.element.style.height = (window.liandi.centerLayout.parent.element.clientHeight - 200) + "px";
                layout.element.style.height = "206px";
            } else if (layout.type === "bottom" &&
                (layout.element.clientHeight + window.liandi.centerLayout.parent.element.clientHeight + window.liandi.topLayout.element.clientHeight > window.innerHeight
                    || layout.element.clientHeight < 7)) {
                window.liandi.centerLayout.parent.element.style.height = (window.liandi.centerLayout.parent.element.clientHeight - 200) + "px";
                window.liandi.bottomLayoutHeight = 200;
            }
        } else if (layout.children[0].children.length === 1) {
            if (layout.type === "left" || layout.type === "right") {
                layout.parent.children[1].element.style.width = (layout.parent.children[1].element.clientWidth + layout.element.clientWidth - 6) + "px";
                layout.parent.children[1].element.classList.remove("fn__flex-1");
                if (layout.type === "left") {
                    layout.element.style.width = "6px";
                } else {
                    layout.element.style.width = "";
                    layout.element.classList.add("fn__flex-1");
                    window.liandi.rightLayoutWidth = 6;
                }
            } else {
                layout.parent.children[1].element.style.height = (layout.parent.children[1].element.clientHeight + layout.element.clientHeight - 6) + "px";
                layout.parent.children[1].element.classList.remove("fn__flex-1");
                if (layout.type === "top") {
                    layout.element.style.height = "6px";
                } else {
                    layout.element.style.height = "";
                    layout.element.classList.add("fn__flex-1");
                    window.liandi.bottomLayoutHeight = 6;
                }
            }
        }
        resizeTabs();
    }
}
