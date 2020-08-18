import {Wnd} from "./Wnd";
import {genUUID} from "../util/genUUID";

export class Tabs {
    public children: ITab[] = []
    private parent: Wnd

    constructor(wnd: Wnd) {
        this.parent = wnd;
        wnd.element.innerHTML = `<div class="layout__tab fn__flex-column fn__flex fn__flex-1">
    <div class="fn__flex">
        <ul class="fn__flex fn__flex-1 tab__headers"></ul>
        <button data-type="lr">lr</button><button data-type="tb">tb</button><button data-type="close">x</button>
    </div>
    <div class="tab__panels fn__flex-1"></div>
</div>`;

        wnd.element.querySelector("button[data-type='lr']").addEventListener("click", () => {
            wnd.spilt("lr");
        });
        wnd.element.querySelector("button[data-type='tb']").addEventListener("click", () => {
            wnd.spilt("tb");
        });
        wnd.element.querySelector("button[data-type='close']").addEventListener("click", () => {
            wnd.remove();
        });
    }

    public addTab(tab: { title?: string, panel?: string, callback?: (element: HTMLElement) => void }) {
        this.children.forEach((item) => {
            item.headElement?.classList.remove('item--current')
            item.panelElement.classList.add('fn__none')
        })

        let headElement
        if (tab.title) {
            headElement = document.createElement("li");
            headElement.classList.add("item", "item--current")
            headElement.innerHTML = tab.title;
            this.parent.element.querySelector(".tab__headers").append(headElement);
        }

        const panelElement = document.createElement("div");
        panelElement.classList.add("fn__flex-1")
        panelElement.innerHTML = tab.panel || "";
        this.parent.element.querySelector(".tab__panels").append(panelElement);

        this.children.push({
            id: genUUID(),
            headElement,
            panelElement,
        });

        if (tab.callback) {
            tab.callback(panelElement)
        }
    }
}
