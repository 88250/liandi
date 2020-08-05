export const resize = (id: string, next = false) => {
    const resizeElement = document.getElementById(id);
    resizeElement.addEventListener('mousedown', (event: MouseEvent) => {

        const documentSelf = document;
        const sideElement = next ? resizeElement.nextElementSibling : resizeElement.previousElementSibling;
        const x = event.clientX;
        const width = sideElement.clientWidth;
        document.body.style.userSelect = 'none';

        documentSelf.ondragstart = () => false;

        documentSelf.onmousemove = (moveEvent: MouseEvent) => {
            let widthTemp = 0;
            if (next) {
                widthTemp = (width - (moveEvent.clientX - x));
            } else {
                widthTemp = (width + (moveEvent.clientX - x));
            }
            (sideElement as HTMLElement).style.width = widthTemp + 'px';
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
