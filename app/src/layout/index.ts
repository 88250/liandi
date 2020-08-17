import {Wnd} from "./wnd";
import {genUUID} from "../util/genUUID";
import {addResize} from "./util";

export class Layout {
    public element: HTMLElement
    public resizeElement?: HTMLElement
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
        this.element.classList.add('fn__flex', 'layout')
        if (mergedOptions.direction === "tb") {
            this.element.classList.add('fn__flex-column');
        }
        if (mergedOptions.size === 'auto') {
            this.element.classList.add('fn__flex-1')
        } else {
            this.element.style[this.parent.direction === 'tb' ? 'height' : 'width'] = mergedOptions.size
        }
        this.children = []
        if (typeof options.id === 'string') {
            this.parent.children.find((item, index) => {
                if (options.id === item.id) {
                    item.element.before(this.element)
                    return true
                }
            })
        } else {
            this.parent.element.append(this.element)
        }
        addResize(this, options.resize);
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
