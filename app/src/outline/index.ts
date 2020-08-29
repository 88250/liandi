import {Tab} from "../layout/Tab";
import {Model} from "../layout/Model";
import {hasClosestByHeadings} from "../../vditore/src/ts/util/hasClosestByHeadings";
import {getAllModels} from "../layout/util";
import {bgFade} from "../util/bgFade";
import {processMessage} from "../util/processMessage";

export class Outline extends Model {
    private element: HTMLElement
    public url: string
    public path: string

    constructor(options: {
        contentElement: HTMLElement | string,
        tab: Tab,
        url: string,
        path: string
    }) {
        super({
            id: options.tab.id
        });
        this.ws.onmessage = (event) => {
            const data = processMessage(event.data);
            if (data) {
                switch (data.cmd) {
                    case "rename":
                        if (data.data.url === this.url && data.data.oldPath === this.path) {
                            this.path = data.data.newPath;
                            this.parent.headElement.querySelector("span").textContent = data.data.newName;
                        }
                        break;
                    case "unmount":
                    case "remove":
                        if (this.url === data.data.url && this.path.indexOf(data.data.path) === 0) {
                            this.parent.parent.removeTab(this.parent.id);
                        }
                        break;
                    case "reload":
                        if (data.data.url === this.url && data.data.path === this.path) {
                            getAllModels().editor.find((item) => {
                                if (data.data.url === item.url && data.data.path === item.path) {
                                    this.render(item.vditore.vditor.ir.element);
                                    return true;
                                }
                            });
                        }
                        break;
                }
            }
        };
        this.url = options.url;
        this.path = options.path;
        this.element = options.tab.panelElement;
        this.element.classList.add("vditor-outline");
        this.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.isEqualNode(this.element)) {
                if (target.classList.contains("vditor-outline__item")) {
                    getAllModels().editor.forEach((item) => {
                        const vditorElement = item.vditore.vditor.ir.element;
                        const headingElement = vditorElement.querySelector(`#${target.getAttribute("data-id")}`) as HTMLElement;
                        if (!headingElement) {
                            return;
                        }
                        item.vditore.vditor.ir.element.scrollTop = headingElement.offsetTop - 10;
                        bgFade(headingElement);
                    });
                    this.element.querySelectorAll(".vditor-outline__item").forEach((item) => {
                        item.classList.remove("vditor-outline__item--current");
                    });
                    target.classList.add("vditor-outline__item--current");
                }
                target = target.parentElement;
            }
        });
        this.render(options.contentElement);
    }

    private render(contentElement: HTMLElement | string) {
        if (typeof contentElement === "string") {
            this.element.innerHTML = contentElement;
            return;
        }
        let tocHTML = "";
        Array.from(contentElement.children).forEach((item: HTMLElement) => {
            if (hasClosestByHeadings(item)) {
                const headingNo = parseInt(item.tagName.substring(1), 10);
                const space = new Array(headingNo - 1).fill("&emsp;").join("");
                let text = "";
                const markerElement = item.querySelector('[data-type="heading-marker"]');
                if (markerElement.getAttribute("data-render") === "2") {
                    text = item.textContent.replace(markerElement.textContent, "").trim();
                } else {
                    text = item.textContent.substring(headingNo + 1).trim();
                }
                tocHTML += `<div data-id="${item.id}" class="vditor-outline__item">${space}${text}</div>`;
            }
        });
        this.element.innerHTML = tocHTML;
    }
}
