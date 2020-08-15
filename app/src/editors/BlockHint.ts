import {hasClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {Constants} from "../constants";
import {scrollCenter} from "../../vditore/src/ts/util/editorCommonEvent";

export class BlockHint {
    private element = document.getElementById("editorBlockHint")
    private blockRefElement: HTMLElement
    private timeoutId: number

    constructor() {
        this.element.addEventListener("mouseenter", (event) => {
            clearTimeout(this.timeoutId);
        });
        this.element.addEventListener("mouseleave", () => {
            this.timeoutId = window.setTimeout(() => {
                this.element.style.display = "none"
            }, 300)
        });
    }

    public initEvent(liandi: ILiandi, element: HTMLElement) {
        element.addEventListener("mouseover", (event: MouseEvent & { target: HTMLElement }) => {
            const blockRefElement = hasClosestByAttribute(event.target, "data-type", "block-ref")
            if (blockRefElement) {
                this.show(liandi, blockRefElement)
                clearTimeout(this.timeoutId);
                blockRefElement.onmouseleave = () => {
                    this.timeoutId = window.setTimeout(() => {
                        this.element.style.display = "none"
                    }, 300)
                }
            }
        });
    }

    private show(liandi: ILiandi, blockRefElement: HTMLElement) {
        this.blockRefElement = blockRefElement;
        liandi.ws.send("getblock", {
            id: blockRefElement.querySelector('.vditor-ir__marker--link').textContent
        })
    }

    public getBlock(liandi: ILiandi, data: { id: string, block: IBlock, callback: string }) {
        if (!data.block) {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_OPEN) {
            liandi.editors.open(liandi, data.block.url, data.block.path)
            return
        }
        if (data.block.content.trim() === "") {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_EMBED) {
            this.blockRefElement.setAttribute("data-render", "1")
            this.blockRefElement.innerHTML = data.block.content
            scrollCenter(liandi.editors.currentEditor.vditor.vditor);
            return;
        }
        const elementRect = this.blockRefElement.getBoundingClientRect()
        this.element.innerHTML = data.block.content;
        const top = elementRect.top + elementRect.height + 5
        const left = elementRect.left
        this.element.setAttribute("style", `display:block;top:${top}px;left:${left}px`)
        // 展现在上部
        if (this.element.getBoundingClientRect().bottom > window.innerHeight) {
            this.element.style.top = `${top - this.element.clientHeight - 10 - elementRect.height}px`;
        }
        if (this.element.getBoundingClientRect().right > window.innerWidth) {
            this.element.style.left = 'auto';
            this.element.style.right = "0";
        }
    }

    public blockRender(liandi: ILiandi) {
        liandi.editors.currentEditor.vditor.vditor.ir.element.querySelectorAll("span[data-type='block-ref-embed'] span[data-render='2']").forEach((item: HTMLElement) => {
            this.blockRefElement = item
            liandi.ws.send("getblock", {
                id: item.getAttribute("data-block-def-id"),
                callback: Constants.CB_GETBLOCK_EMBED
            })
        });
    }
}
