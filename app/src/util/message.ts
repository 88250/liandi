let timeoutId: number
export const showMessage = (message: string, timeout = 6000) => {
    clearTimeout(timeoutId)

    const messageElement = document.getElementById('message');
    messageElement.classList.add('vditor-tip--show');
    if (timeout === 0) {
        messageElement.innerHTML = `<div class="vditor-tip__content">${message}
<svg class="vditor-tip__close"><use xlink:href="#iconClose"></use></svg></div>`;
        messageElement.querySelector('.vditor-tip__close').addEventListener('click', () => {
            hideMessage();
        });
        return;
    }

    messageElement.innerHTML = `<div class="vditor-tip__content">${message}</div>`;
    timeoutId = window.setTimeout(() => {
        hideMessage();
    }, timeout);
};

export const hideMessage = () => {
    const messageElement = document.getElementById('message');
    messageElement.classList.remove('vditor-tip--show');
    messageElement.innerHTML = '';
};
