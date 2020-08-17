import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addResize} from "./util";

export class Wnd {
    public id: string
    public layout: Layout
    public element: HTMLElement
    public resizeElement: HTMLElement
    public close: boolean

    constructor(options: { layout: Layout, close?: boolean, resize?: string }) {
        count++;
        this.id = genUUID()
        this.close = typeof options.close === "undefined" ? true : options.close
        this.element = document.createElement("div")
        this.element.classList.add('fn__flex-1')
        this.element.innerHTML = `<ul slot="tab" class="tab fn__flex">
    <li data-name="tab${count}" class="fn__pointer">${count}</li>
    <li><button data-type="lr">lr</button><button data-type="tb">tb</button><button data-type="close">x</button></li>
</ul>
<div data-name="tab${count}">
    ${count}content 
</div>`
        this.layout = options.layout
        this.layout.element.append(this.element)
        addResize(this, options.resize);
        this.element.querySelector("button[data-type='lr']").addEventListener('click', () => {
            this.spilt('lr')
        })
        this.element.querySelector("button[data-type='tb']").addEventListener('click', () => {
            this.spilt('tb')
        })
        this.element.querySelector("button[data-type='close']").addEventListener('click', () => {
            if (!this.close) {
                this.element.innerHTML = 'create/mount....'
            } else {
                this.remove()
            }
        })
        return this
    }

    private spilt(direction: string) {
        // TODO new panel & ws
        if (direction === this.layout.direction) {
            this.layout.addChild(new Wnd({layout: this.layout, resize: direction}))
        } else {
            this.layout.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                        parent: this.layout,
                        id: item.id
                    })
                    this.layout.addChild(layout, index);
                    this.layout.children.splice(index + 1, 1);

                    layout.element.append(item.element);
                    layout.children.push(item);
                    (item as Wnd).layout = layout;
                    layout.addChild(new Wnd({layout, resize: direction}));
                    return true
                }
            })
        }
    }

    remove() {
        const removeIt = (element: HTMLElement, layout: Layout, id: string) => {
            element.remove();
            layout.children.find((item, index) => {
                if (item.id === id) {
                    // TODO destroy panel & ws
                    if (item.resizeElement) {
                        item.resizeElement.remove();
                    } else if (index === 0) {
                        layout.children[index + 1].resizeElement.remove();
                    }
                    layout.children.splice(index, 1);
                    return true
                }
            })
        }

        if (this.layout.children.length === 1) {
            if (this.layout.direction !== this.layout.parent.direction && this.layout.parent.children.length === 1) {
                removeIt(this.element.parentElement.parentElement, this.layout.parent.parent, this.layout.parent.id)
            } else {
                removeIt(this.element.parentElement, this.layout.parent, this.layout.id)
            }
        } else {
            removeIt(this.element, this.layout, this.id)
        }
    }
}

let count = 0
