export const animationThrottle = (eventName: string, customEventName: string, obj: HTMLElement | Window) => {
    let running = false;
    obj.addEventListener(eventName, (event) => {
        if (running) {
            return;
        }
        running = true;
        requestAnimationFrame(() => {
            obj.dispatchEvent(new CustomEvent(customEventName, {detail:event}));
            running = false;
        });
    });
};
