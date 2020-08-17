import {Layout} from "./index";
import {Wnd} from "./wnd";

export const addResize = (obj: Layout | Wnd, resize?: string) => {
    if (resize) {
        const resizeElement = document.createElement("div")
        if (resize === "lr") {
            resizeElement.classList.add("layout__resize--lr")
        }
        resizeElement.classList.add("layout__resize")
        obj.element.insertAdjacentElement('beforebegin', resizeElement)
        resizeWnd(resizeElement, resize)
    }
}
const resizeWnd = (resizeElement: HTMLElement, direction: string) => {
    resizeElement.addEventListener('mousedown', (event: MouseEvent) => {
        const documentSelf = document;
        const nextElement = resizeElement.nextElementSibling as HTMLElement;
        const previousElement = resizeElement.previousElementSibling as HTMLElement;
        if (direction === 'lr') {
            nextElement.style.width = nextElement.clientWidth + 'px'
            previousElement.style.width = previousElement.clientWidth + 'px'
        } else {
            nextElement.style.height = nextElement.clientHeight + 'px'
            previousElement.style.height = previousElement.clientHeight + 'px'
        }
        nextElement.classList.remove("fn__flex-1")
        previousElement.classList.remove("fn__flex-1")

        const x = event[direction === 'lr' ? 'clientX' : 'clientY'];
        const previousSize = direction === 'lr' ? previousElement.clientWidth : previousElement.clientHeight
        const nextSize = direction === 'lr' ? nextElement.clientWidth : nextElement.clientHeight;
        document.body.style.userSelect = 'none';

        documentSelf.ondragstart = () => false;

        documentSelf.onmousemove = (moveEvent: MouseEvent) => {
            const previousNowSize = (previousSize + (moveEvent[direction === 'lr' ? 'clientX' : 'clientY'] - x))
            const nextNowSize = (nextSize - (moveEvent[direction === 'lr' ? 'clientX' : 'clientY'] - x))
            if (previousNowSize < 60 || nextNowSize < 60) {
                return;
            }
            previousElement.style[direction === 'lr' ? 'width' : 'height'] = previousNowSize + 'px';
            nextElement.style[direction === 'lr' ? 'width' : 'height'] = nextNowSize + 'px';
        };

        documentSelf.onmouseup = () => {
            document.body.style.userSelect = 'auto';
            documentSelf.onmousemove = null;
            documentSelf.onmouseup = null;
            documentSelf.ondragstart = null;
            documentSelf.onselectstart = null;
            documentSelf.onselect = null;
            window.dispatchEvent(new CustomEvent('resize'));
        };
    });
};
