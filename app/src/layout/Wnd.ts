import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addCenterWnd, addResize} from "./util";
import {Tabs} from "./Tabs";

export class Wnd {
    public id: string
    public parent?: Layout
    public element: HTMLElement
    public children?: Tabs
    public resize?: TDirection
    public callback?: (wnd: Wnd) => void

    constructor(options: IWndOptions) {
        this.id = genUUID();
        this.resize = options.resize
        this.callback = options.callback
        this.element = document.createElement("div");
        this.element.classList.add("fn__flex-1");
        this.children = new Tabs(this);
        if (options.html || options.title) {
            this.children.addTab({
                title: options.title,
                panel: options.html
            });
        }
    }

    public spilt(direction: TDirection) {
        // TODO new panel & ws
        if (direction === this.parent.direction) {
            this.parent.addWnd(new Wnd({resize: direction, html: (count++).toString()}), this.id);
        } else {
            this.parent.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                    });
                    this.parent.addLayout(layout, item.id);
                    layout.addWnd.apply(layout, this.parent.children.splice(index, 1));
                    layout.addWnd.call(layout, new Wnd({resize: direction}));
                    return true;
                }
            });
        }
    }

    public remove() {
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
            if (layout.type === 'left' || layout.type === 'right') {
                layout.parent.children[1].element.style.width = (layout.parent.children[1].element.clientWidth + layout.element.clientWidth - 6) + 'px'
                if (layout.type === 'left') {
                    layout.element.style.width = '6px'
                } else {
                    layout.element.style.width = 'auto'
                    layout.element.classList.add("fn__flex-1")
                }
            } else {
                layout.parent.children[1].element.style.height = (layout.parent.children[1].element.clientHeight + layout.element.clientHeight - 6) + 'px'
                if (layout.type === 'top') {
                    layout.element.style.height = '6px'
                } else {
                    layout.element.style.height = 'auto'
                    layout.element.classList.add("fn__flex-1")
                }
            }
        }
    }
}

let count = 0
