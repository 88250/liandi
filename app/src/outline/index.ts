import {Tab} from "../layout/Tab";
import {Model} from "../layout/Model";
import {hasClosestByHeadings} from "../../vditore/src/ts/util/hasClosestByHeadings";
import {getAllModels} from "../layout/util";

export class Outline extends Model {
    private element: HTMLElement

    constructor(options: {
        url: string,
        path: string,
        contentElement: HTMLElement,
        tab: Tab
    }) {
        super({
            id: options.tab.id
        });
        this.element = options.tab.panelElement
        this.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.isEqualNode(this.element)) {
                if (target.classList.contains("vditor-outline__item")) {
                    getAllModels().editor.find((item) => {
                        const vditorElement = item.vditore.vditor.ir.element;
                        const headingElement = vditorElement.querySelector(`#${target.getAttribute("data-id")}`) as HTMLElement;
                        if (!headingElement) {
                            return;
                        }
                        item.vditore.vditor.ir.element.scrollTop = headingElement.offsetTop;
                    })
                    this.element.querySelectorAll(".vditor-outline__item").forEach((item) => {
                        item.classList.remove("vditor-outline__item--current");
                    });
                    target.classList.add("vditor-outline__item--current");
                }
                target = target.parentElement;
            }
        });
        this.render(options.contentElement)
    }

    public render(contentElement: HTMLElement) {
        let tocHTML = ''
        Array.from(contentElement.children).forEach((item: HTMLElement, index) => {
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

                const lastIndex = item.id.lastIndexOf("_");
                const lastId = item.id.substring(0, lastIndex === -1 ? undefined : lastIndex);
                item.id = lastId + "_" + index;
                tocHTML += `<div data-id="${item.id}" class="vditor-outline__item">${space}${text}</div>`;
            }
        });
        this.element.innerHTML = tocHTML;
    }
}
