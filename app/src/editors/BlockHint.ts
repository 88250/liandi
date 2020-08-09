import {hasClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";

export class BlockHint {
    private element: HTMLElement
    private blockRefElement: HTMLElement

    constructor() {
        this.element = document.getElementById("editorBlockHint")
    }

    public initEvent(liandi: ILiandi, element: HTMLElement) {
        element.addEventListener("mouseover", (event: MouseEvent & { target: HTMLElement }) => {
            const blockRefElement = hasClosestByAttribute(event.target, "data-type", "block-ref")
            if (blockRefElement) {
                this.show(liandi, blockRefElement)
            }
        });

        element.addEventListener("mouseout", () => {
            this.element.style.display = "none"
        });
    }

    private show(liandi: ILiandi, blockRefElement: HTMLElement) {
        this.blockRefElement = blockRefElement;
        liandi.ws.send("getblock", {
            id: blockRefElement.querySelector('.vditor-ir__marker--link').textContent
        })
    }

    public onGetBlock(data: { id: string, block: IBlock }) {
        if (data.block) {
            return;
        }
        const elementRect = this.blockRefElement.getBoundingClientRect()
        this.element.innerHTML = data.block.content;
        const top = elementRect.top + elementRect.height + 5
        let left = elementRect.left
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
}
