export const delegate = (element: HTMLElement, eventName: string, elementSelector: string,
                         handler: (target: HTMLElement, event: IEvent) => void) => {
    element.addEventListener(eventName, function (event: IEvent) {
        for (let target = event.target; target && target != this; target = target.parentElement) {
            if (target.matches(elementSelector)) {
                handler(target, event);
                break;
            }
        }
    }, false);
}
