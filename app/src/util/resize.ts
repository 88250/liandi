export const resize = (id: string) => {
    const resizeElement = document.getElementById(id)
    resizeElement.addEventListener("mousedown", (event: MouseEvent) => {

        const documentSelf = document;
        const previousElement = resizeElement.previousElementSibling as HTMLElement
        const x = event.clientX;
        const width = previousElement.clientWidth;
        document.body.style.userSelect = 'none'

        documentSelf.ondragstart = () => false;

        documentSelf.onmousemove = (moveEvent: MouseEvent) => {
            previousElement.style.width = (width + (moveEvent.clientX - x)) + "px";
        };

        documentSelf.onmouseup = () => {
            document.body.style.userSelect = 'auto'
            documentSelf.onmousemove = null;
            documentSelf.onmouseup = null;
            documentSelf.ondragstart = null;
            documentSelf.onselectstart = null;
            documentSelf.onselect = null;
        };
    });
}
