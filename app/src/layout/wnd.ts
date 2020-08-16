import {Layout} from "./index";
import {genUUID} from "../util/genUUID";

export class Wnd {
    public id: string
    public layout: Layout
    public element: HTMLElement

    constructor(options: { layout: Layout, close?: boolean }) {
        count++;
        this.id = genUUID()
        this.element = document.createElement("div")
        this.element.classList.add('fn__flex-1')
        this.element.innerHTML = `<ul slot="tab" class="tab fn__flex">
    <li data-name="tab${count}" class="fn__pointer">${count}</li>
    <li><button data-type="lr">lr</button><button data-type="tb">tb</button>${(typeof options.close === "undefined" || options.close) ? '<button data-type="close">x</button>' : ''}</li>
</ul>
<div data-name="tab${count}">
    ${count}content 
</div>`
        this.layout = options.layout
        this.layout.element.append(this.element)
        this.element.querySelector("button[data-type='lr']").addEventListener('click', () => {
            this.spilt('lr')
        })
        this.element.querySelector("button[data-type='tb']").addEventListener('click', () => {
            this.spilt('tb')
        })
        this.element.querySelector("button[data-type='close']")?.addEventListener('click', () => {
            this.remove()
        })
        return this
    }

    private spilt(direction: string) {
        // TODO new panel & ws
        if (direction === this.layout.direction) {
            this.layout.addChild(new Wnd({layout: this.layout}))
        } else {
            this.layout.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                        parent: this.layout,
                        index
                    })
                    this.layout.addChild(layout, index);
                    this.layout.children.splice(index + 1, 1);

                    layout.element.append(item.element);
                    layout.children.push(item);
                    (item as Wnd).layout = layout;
                    layout.addChild(new Wnd({layout}));
                    return true
                }
            })
        }
    }

    remove() {
        // TODO destroy panel & ws
        if (this.layout.children.length === 1) {
            if (this.layout.direction !== this.layout.parent.direction && this.layout.parent.children.length === 1) {
                this.element.parentElement.parentElement.remove()
                this.layout.parent.parent.children.find((item, index) => {
                    if (item.id === this.layout.parent.id) {
                        this.layout.parent.parent.children.splice(index, 1);
                        return true
                    }
                })
            } else {
                this.element.parentElement.remove()
                this.layout.parent.children.find((item, index) => {
                    if (item.id === this.layout.id) {
                        this.layout.parent.children.splice(index, 1);
                        return true
                    }
                })
            }
        } else {
            this.element.remove();
            this.layout.children.find((item, index) => {
                if (item.id === this.id) {
                    this.layout.children.splice(index, 1);
                    return true
                }
            })
        }
    }
}

let count = 0
