import {Layout} from "./index";
import {Wnd} from "./wnd";
import {i18n} from "../i18n";
import {mountFile, mountWebDAV} from "../util/mount";
import {Tab} from "./Tab";

export const addResize = (obj: Layout | Wnd) => {
    if (obj.resize) {
        const resizeElement = document.createElement("div");
        if (obj.resize === "lr") {
            resizeElement.classList.add("layout__resize--lr");
        }
        resizeElement.classList.add("layout__resize");
        obj.element.insertAdjacentElement("beforebegin", resizeElement);
        resizeWnd(resizeElement, obj.resize);
    }
};

export const addCenterWnd = () => {
    const wnd = new Wnd();
    wnd.addTab(new Tab({
        panel: `<div class="layout__empty">
                    <div class="item fn__flex-inline">${i18n[window.liandi.config.lang].search}/${i18n[window.liandi.config.lang].config} &lt;Double Shift></div>
                    <div class="item fn__a fn__pointer" id="editorEmptyMount">${i18n[window.liandi.config.lang].mount}</div>
                    <div class="item fn__a fn__pointer" id="editorEmptyMountDAV">${i18n[window.liandi.config.lang].mountWebDAV}</div>
                </div>`,
        callback(tab: Tab) {
            tab.panelElement.querySelector("#editorEmptyMount").addEventListener("click", () => {
                mountFile();
            });
            tab.panelElement.querySelector("#editorEmptyMountDAV").addEventListener("click", () => {
                mountWebDAV();
            });
        }
    }));
    ((window.liandi.layout.children[1] as Layout).children[1] as Layout).addWnd(wnd);
};

const setSize = (item: HTMLElement, direction: string) => {
    if (item.classList.contains("fn__flex-1")) {
        if (direction === "lr") {
            item.style.width = item.clientWidth + "px";
        } else {
            item.style.height = item.clientHeight + "px";
        }
        item.classList.remove("fn__flex-1");
    }
};

const resizeWnd = (resizeElement: HTMLElement, direction: string) => {
    resizeElement.addEventListener("mousedown", (event: MouseEvent) => {
        const documentSelf = document;
        const nextElement = resizeElement.nextElementSibling as HTMLElement;
        const previousElement = resizeElement.previousElementSibling as HTMLElement;
        setSize(nextElement, direction);
        setSize(previousElement, direction);
        const x = event[direction === "lr" ? "clientX" : "clientY"];
        const previousSize = direction === "lr" ? previousElement.clientWidth : previousElement.clientHeight;
        const nextSize = direction === "lr" ? nextElement.clientWidth : nextElement.clientHeight;
        document.body.style.userSelect = "none";

        documentSelf.ondragstart = () => false;

        documentSelf.onmousemove = (moveEvent: MouseEvent) => {
            const previousNowSize = (previousSize + (moveEvent[direction === "lr" ? "clientX" : "clientY"] - x));
            const nextNowSize = (nextSize - (moveEvent[direction === "lr" ? "clientX" : "clientY"] - x));
            if (previousNowSize < 6 || nextNowSize < 6) {
                return;
            }
            previousElement.style[direction === "lr" ? "width" : "height"] = previousNowSize + "px";
            nextElement.style[direction === "lr" ? "width" : "height"] = nextNowSize + "px";
        };

        documentSelf.onmouseup = () => {
            document.body.style.userSelect = "auto";
            documentSelf.onmousemove = null;
            documentSelf.onmouseup = null;
            documentSelf.ondragstart = null;
            documentSelf.onselectstart = null;
            documentSelf.onselect = null;

            if (!nextElement.nextElementSibling) {
                nextElement.style[direction === "lr" ? "width" : "height"] = "auto";
                nextElement.classList.add("fn__flex-1");
            }

            window.dispatchEvent(new CustomEvent("resize"));
        };
    });
};
