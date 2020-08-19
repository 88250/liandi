import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addCenterWnd} from "./util";
import {Tab} from "./Tab";

export class Wnd {
    public id: string
    public parent?: Layout
    public element: HTMLElement
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
        <button data-type="lr">lr</button><button data-type="tb">tb</button><button data-type="close">x</button>
    </div>
    <div class="tab__panels fn__flex-1"></div>
</div>`;
        this.element.querySelector("button[data-type='lr']").addEventListener("click", () => {
            this.spilt("lr");
        });
        this.element.querySelector("button[data-type='tb']").addEventListener("click", () => {
            this.spilt("tb");
        });
        this.element.querySelector("button[data-type='close']").addEventListener("click", () => {
            this.remove();
        });
    }

    public addTab(tab: Tab) {
        this.children.forEach((item) => {
            item.headElement?.classList.remove("item--current");
            item.panelElement.classList.add("fn__none");
        });
        this.children.push(tab);
        if (tab.headElement) {
            this.element.querySelector(".tab__headers").append(tab.headElement);
        }
        this.element.querySelector(".tab__panels").append(tab.panelElement);

        tab.parent = this;
        if (tab.callback) {
            tab.callback(tab);
        }
    }

    private spilt(direction: TDirection) {
        // TODO new panel & ws
        if (direction === this.parent.direction) {
            this.parent.addWnd(new Wnd( direction), this.id);
        } else {
            this.parent.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                    });
                    this.parent.addLayout(layout, item.id);
                    layout.addWnd.call(layout, this.parent.children.splice(index, 1)[0]);
                    layout.addWnd.call(layout, new Wnd(direction));
                    return true;
                }
            });
        }
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
                if (layout.type === "left") {
                    layout.element.style.width = "6px";
                } else {
                    layout.element.style.width = "auto";
                    layout.element.classList.add("fn__flex-1");
                }
            } else {
                layout.parent.children[1].element.style.height = (layout.parent.children[1].element.clientHeight + layout.element.clientHeight - 6) + "px";
                if (layout.type === "top") {
                    layout.element.style.height = "6px";
                } else {
                    layout.element.style.height = "auto";
                    layout.element.classList.add("fn__flex-1");
                }
            }
        }
    }
}
