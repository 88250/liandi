import {Wnd} from "./Wnd";
import {genUUID} from "../util/genUUID";

export class Tab {
    public parent: Wnd
    public id: string
    public headElement: HTMLElement
    public panelElement: HTMLElement
    public callback: (tab: Tab) => void
    public model:any

    constructor(options: ITab) {
        this.id = genUUID();
        this.callback = options.callback;
        if (options.title) {
            this.headElement = document.createElement("li");
            this.headElement.classList.add("item", "item--current");
            this.headElement.innerHTML = options.title;
        }

        this.panelElement = document.createElement("div");
        this.panelElement.classList.add("fn__flex-1");
        this.panelElement.innerHTML = options.panel || "";
    }

    public addModel(model:any) {
        this.model = model;
        model.parent = this;
    }
}
