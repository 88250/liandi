import {Layout} from "./index";
import {Wnd} from "./wnd";

export  const addResize= (obj:Layout|Wnd, resize?: string) => {
    if (resize) {
        obj.resizeElement = document.createElement("div")
        if (resize === "lr") {
            obj.resizeElement.classList.add("layout__resize--lr")
        }
        obj.resizeElement.classList.add("layout__resize")
        obj.element.insertAdjacentElement('beforebegin', obj.resizeElement)
    }
}
