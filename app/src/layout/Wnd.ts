import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addResize} from "./util";
import {Tabs} from "./Tabs";

export class Wnd {
    public id: string
    public parent?: Layout
    public element: HTMLElement
    public resizeElement?: HTMLElement
    public tabs?: Tabs

    constructor(options: { parent: Layout, resize?: string, splitId?: string, html?: string, title?: string, callback?: Function }) {
        this.id = genUUID()
        this.element = document.createElement("div")
        this.element.classList.add('fn__flex-1')
        this.tabs = new Tabs(this)
        if (options.html || options.title) {
            this.tabs.addTab({
                title: options.title,
                panel: options.html
            })
        }
        this.parent = options.parent;
        if (options.splitId) {
            this.parent.children.find((item) => {
                if (item.id === options.splitId) {
                    item.element.style.width = 'auto'
                    item.element.style.height = 'auto'
                    item.element.classList.add('fn__flex-1')
                    item.element.after(this.element)
                    return true
                }
            })
        } else {
            this.parent.element.append(this.element)
        }

        if (options.callback) {
            options.callback(this)
        }

        addResize(this, options.resize);
        return this
    }

    public spilt(direction: string) {
        // TODO new panel & ws
        if (direction === this.parent.direction) {
            this.parent.addChild(new Wnd({parent: this.parent, resize: direction, splitId: this.id}), this.id)
        } else {
            this.parent.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                        parent: this.parent,
                        id: item.id
                    })
                    this.parent.addChild(layout, item.id);
                    this.parent.children.splice(index, 1);

                    layout.element.append(item.element);
                    layout.children.push(item);
                    (item as Wnd).parent = layout;
                    layout.addChild(new Wnd({parent:layout, resize: direction, splitId: item.id}));
                    return true
                }
            })
        }
    }

    public remove() {
        let layout = this.parent
        let id = this.id
        let element = this.element
        while (layout && layout.children.length === 1) {
            id = layout.id
            element = layout.element
            layout = layout.parent
            // TODO destroy panel & ws
        }

        layout.children.find((item, index) => {
            if (item.id === id) {
                if (layout.children.length > 1) {
                    let sideElement = layout.children[index - 1]
                    if (index === 0) {
                        sideElement = layout.children[1]
                    }
                    if (layout.direction === "lr") {
                        sideElement.element.style.width = (sideElement.element.clientWidth + element.clientWidth) + "px"
                    } else {
                        sideElement.element.style.height = (sideElement.element.clientHeight + element.clientHeight) + "px"
                    }
                }
                layout.children.splice(index, 1);
                return true
            }
        })
        if (element.previousElementSibling && element.previousElementSibling.classList.contains("layout__resize")) {
            element.previousElementSibling.remove()
        } else if (element.nextElementSibling && element.nextElementSibling.classList.contains("layout__resize")) {
            element.nextElementSibling.remove()
        }
        // TODO destroy panel & ws
        element.remove();
    }
}
