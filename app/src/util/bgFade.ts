export const bgFade = (element: HTMLElement) => {
    element.style.backgroundColor = "var(--border-color)";
    element.style.borderRadius = "3px";
    element.style.boxShadow = "5px 0px 0 var(--border-color), -5px 0px 0 var(--border-color)";
    setTimeout(function () {
        element.style.transition = "all 2s cubic-bezier(0.4, 0, 1, 1)";
        element.style.backgroundColor = "var(--toolbar-background-color)";
        element.style.boxShadow = "5px 0px 0 var(--toolbar-background-color), -5px 0px 0 var(--toolbar-background-color)";
    });
    setTimeout(function () {
        element.removeAttribute("style");
    }, 2001);
};
