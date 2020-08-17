import {Layout} from "./index";
import {genUUID} from "../util/genUUID";
import {addResize} from "./util";

export class Wnd {
    public id: string
    public layout: Layout
    public element: HTMLElement
    public resizeElement: HTMLElement

    constructor(options: { layout: Layout, resize?: string, splitId?: string, html?: string }) {
        count++;
        this.id = genUUID()
        this.element = document.createElement("div")
        this.element.classList.add('fn__flex-1')
        this.element.style.backgroundColor = randomHexColorCode();
        this.element.innerHTML = options.html || `<ul slot="tab" class="tab fn__flex">
    <li data-name="tab${count}" class="fn__pointer">${count}</li>
    <li><button data-type="lr">lr</button><button data-type="tb">tb</button><button data-type="close">x</button></li>
</ul>
<div data-name="tab${count}">
    ${count}content 
</div>`
        this.layout = options.layout
        if (options.splitId) {
            this.layout.children.find((item) => {
                if (item.id === options.splitId) {
                    item.element.style.width = 'auto'
                    item.element.style.height = 'auto'
                    item.element.classList.add('fn__flex-1')
                    item.element.after(this.element)
                    return true
                }
            })
        } else {
            this.layout.element.append(this.element)
        }

        addResize(this, options.resize);

        if (!options.html) {
            this.element.querySelector("button[data-type='lr']").addEventListener('click', () => {
                this.spilt('lr')
            })
            this.element.querySelector("button[data-type='tb']").addEventListener('click', () => {
                this.spilt('tb')
            })
            this.element.querySelector("button[data-type='close']").addEventListener('click', () => {
                this.remove()
            })
        }
        return this
    }

    private spilt(direction: string) {
        // TODO new panel & ws
        if (direction === this.layout.direction) {
            this.layout.addChild(new Wnd({layout: this.layout, resize: direction, splitId: this.id}), this.id)
        } else {
            this.layout.children.find((item, index) => {
                if (item.id === this.id) {
                    const layout = new Layout({
                        direction,
                        parent: this.layout,
                        id: item.id
                    })
                    this.layout.addChild(layout, item.id);
                    this.layout.children.splice(index, 1);

                    layout.element.append(item.element);
                    layout.children.push(item);
                    (item as Wnd).layout = layout;
                    layout.addChild(new Wnd({layout, resize: direction, splitId: item.id}));
                    return true
                }
            })
        }
    }

    private remove() {
        let layout = this.layout
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

let count = 0

const randomHexColorCode = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
};
