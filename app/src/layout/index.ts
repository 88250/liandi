import {Wnd} from "./wnd";
import {genUUID} from "../util/genUUID";

export class Layout {
    public element: HTMLElement
    public children?: Array<Layout | Wnd>
    public parent?: Layout
    public wnd?: Wnd
    public direction: string
    public id?: string

    constructor(options?: ILayoutOptions) {
        const mergedOptions = Object.assign({
            direction: 'tb',
            size: 'auto'
        }, options)

        if (!options.parent) {
            this.parent = {
                id: genUUID(),
                element: document.getElementById("layouts"),
                direction: 'tb'
            }
        } else {
            this.parent = options.parent
        }
        this.id = genUUID()
        this.direction = mergedOptions.direction
        this.element = document.createElement("div")
        this.element.classList.add('fn__flex')
        if (mergedOptions.direction === "tb") {
            this.element.classList.add('fn__flex-column')
        }
        if (mergedOptions.size === 'auto') {
            this.element.classList.add('fn__flex-1')
        } else {
            this.element.style[this.parent.direction === 'tb' ? 'height' : 'width'] = mergedOptions.size
        }
        this.children = []
        if (typeof options.index === 'number') {
            this.parent.element.childNodes[options.index].before(this.element)
        } else {
            this.parent.element.append(this.element)
        }
        return this
    }

    addChild?(child: Layout | Wnd, index?: number) {
        if (typeof index === 'undefined') {
            index = this.children.length
        }
        this.children.splice(index, 0, child)
    }

    moveChild?(child: Layout | Wnd) {
        this.children.push(child)

    }
}
