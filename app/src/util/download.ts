import {i18n} from "../i18n";
import {showMessage} from "./message";

export const exportFile = (content: string, filename: string) => {
    const aElement = document.createElement("a");
    if ("download" in aElement) {
        aElement.download = filename;
        aElement.style.display = "none";
        aElement.href = URL.createObjectURL(new Blob([content]));

        document.body.appendChild(aElement);
        aElement.click();
        aElement.remove();
    } else {
        showMessage(i18n[window.liandi.config.lang].downloadTip, 0);
    }
};
