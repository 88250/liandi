import {WebSocketUtil} from "../websocket";
import {Wnd} from "./Wnd";
import {genUUID} from "../util/genUUID";
import {File} from "../file";

export class Tabs {
    public data: {
        model?: File
        id: string
        headElement: HTMLElement,
        panelElement: HTMLElement,
        ws?: WebSocketUtil
    }[] = []
    private parent:Wnd

    constructor(wnd: Wnd) {
        this.parent = wnd
        wnd.element.innerHTML = `<div class="fn__flex-column fn__flex">
    <div class="fn__flex">
        <ul class="fn__flex fn__flex-1 tab__headers"></ul>
        <button data-type="lr">lr</button><button data-type="tb">tb</button><button data-type="close">x</button>
    </div>
    <div class="tab__panels fn__flex-1"></div>
</div>`

        wnd.element.querySelector("button[data-type='lr']").addEventListener('click', () => {
            wnd.spilt('lr')
        })
        wnd.element.querySelector("button[data-type='tb']").addEventListener('click', () => {
            wnd.spilt('tb')
        })
        wnd.element.querySelector("button[data-type='close']").addEventListener('click', () => {
            wnd.remove()
        })
        return this
    }

    public addTab(tab: { title: string, panel: string }) {
        const titleElement = document.createElement("li")
        if (tab.title) {
            titleElement.innerHTML = tab.title;
        }
        const panelElement = document.createElement("div")
        if (tab.panel) {
            panelElement.innerHTML = tab.panel;
        }

        this.data.push({
            id: genUUID(),
            headElement: titleElement,
            panelElement: panelElement,
        })

        this.parent.element.querySelector('.tab__headers').append(titleElement)
        this.parent.element.querySelector('.tab__panels').append(panelElement)
    }
}
