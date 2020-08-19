import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addCenterWnd} from "./util";
import {Tab} from "./Tab";

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
        this.element.innerHTML = `<div class="layout__tab fn__flex-column fn__flex fn__flex-1">
    <div class="fn__flex">
        <ul class="fn__flex fn__flex-1 tab__headers"></ul>
    </div>
    <div class="tab__panels fn__flex-1"></div>
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
    }

    private switchTab(target: HTMLElement) {
        this.children.forEach((item) => {
            if (target === item.headElement) {
                item.headElement?.classList.add("item--current");
                item.panelElement.classList.remove("fn__none");
            } else {
                item.headElement?.classList.remove("item--current");
                item.panelElement.classList.add("fn__none");
            }
        });
    }

    public addTab(tab: Tab) {
        this.children.forEach((item) => {
            item.headElement?.classList.remove("item--current");
            item.panelElement.classList.add("fn__none");
        });
        this.children.push(tab);

        if (tab.headElement) {
            this.headersElement.append(tab.headElement);
            tab.headElement.querySelector(".item__svg--close").addEventListener("click", (event) => {
                this.removeTab(tab.id);
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

    private removeTab(id: string) {
        if (this.children.length === 1) {
            this.children = []
            this.remove();
        }
        this.children.find((item, index) => {
            if (item.id === id) {
                if (item.headElement.classList.contains("item--current")) {
                    let currentIndex = index + 1;
                    if (index === this.children.length - 1) {
                        currentIndex = index - 1;
                    }
                    this.switchTab(this.children[currentIndex].headElement);
                }
                item.headElement.remove();
                item.panelElement.remove();
                // TODO distory
                this.children.splice(index, 1);
                return true;
            }
        });
    }

    public spilt(direction: TDirection) {
        // TODO new panel & ws
        const wnd = new Wnd(direction)
        if (direction === this.parent.direction) {
            this.parent.addWnd(wnd, this.id);
        } else {
            this.parent.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                    });
                    this.parent.addLayout(layout, item.id);
                    layout.addWnd.call(layout, this.parent.children.splice(index, 1)[0]);
                    layout.addWnd.call(layout, wnd);
                    return true;
                }
            });
        }
        return wnd
    }

    private remove() {
        let layout = this.parent;
        let id = this.id;
        let element = this.element;
        while (layout && layout.children.length === 1 && !["top", "bottom", "left", "right", "center"].includes(layout.type)) {
            id = layout.id;
            element = layout.element;
            layout = layout.parent;
            // TODO destroy panel & ws
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
        // TODO destroy panel & ws
        element.remove();
        if (layout.type === "center" && layout.children.length === 0) {
            addCenterWnd();
        }
        if (layout.type !== "center" && layout.type !== "normal" && layout.children.length === 0) {
            if (layout.type === "left" || layout.type === "right") {
                layout.parent.children[1].element.style.width = (layout.parent.children[1].element.clientWidth + layout.element.clientWidth - 6) + "px";
                layout.parent.children[1].element.classList.remove("fn__flex-1")
                if (layout.type === "left") {
                    layout.element.style.width = "6px";
                } else {
                    layout.element.style.width = "auto";
                    layout.element.classList.add("fn__flex-1");
                    window.liandi.rightLayoutWidth = 6;
                }
            } else {
                layout.parent.children[1].element.style.height = (layout.parent.children[1].element.clientHeight + layout.element.clientHeight - 6) + "px";
                layout.parent.children[1].element.classList.remove("fn__flex-1")
                if (layout.type === "top") {
                    layout.element.style.height = "6px";
                } else {
                    layout.element.style.height = "auto";
                    layout.element.classList.add("fn__flex-1");
                    window.liandi.bottomLayoutHeight = 6;
                }
            }
        }
    }
}
