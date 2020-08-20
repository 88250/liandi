import {Wnd} from "./Wnd";
import {genUUID} from "../util/genUUID";
import {Model} from "./Model";
import {Editor} from "../editor";

export class Tab {
    public parent: Wnd
    public id: string
    public headElement: HTMLElement
    public panelElement: HTMLElement
    public callback: (tab: Tab) => void
    public model: Model

    constructor(options: ITab) {
        this.id = genUUID();
        this.callback = options.callback;
        if (options.title) {
            this.headElement = document.createElement("li");
            this.headElement.setAttribute("data-type", "tab-header");
            this.headElement.setAttribute("data-id", this.id);
            this.headElement.classList.add("item", "item--current");
            this.headElement.innerHTML = options.title + "<svg class='item__svg item__svg--close'><use xlink:href='#iconClose'></use></svg>";
        }

        this.panelElement = document.createElement("div");
        this.panelElement.classList.add("fn__flex-1");
        this.panelElement.innerHTML = options.panel || "";
    }

    public addModel(model: Model) {
        if (model instanceof Editor) {
            this.headElement.setAttribute("data-type", "tab-header-editor");
        }
        this.model = model;
        model.parent = this;
    }
}
