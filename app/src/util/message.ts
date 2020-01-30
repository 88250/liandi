let timeoutId: number;
export const showMessage = (message: string, timeout = 6000) => {
    clearTimeout(timeoutId);

    let messageElement = document.getElementById('message');
    if (!messageElement) {
        document.body.insertAdjacentHTML('beforeend', '<div class="message" id="message"></div>');
        messageElement = document.getElementById('message');
    }

    if (timeout === 0) {
        messageElement.innerHTML = `<div class="message__content">${message}
<svg class="message__close"><use xlink:href="#iconClose"></use></svg></div>`;
        messageElement.querySelector('.message__close').addEventListener('click', () => {
            hideMessage();
        });
        return;
    }

    messageElement.innerHTML = `<div class="message__content">${message}</div>`;
    timeoutId = window.setTimeout(() => {
        hideMessage();
    }, timeout);
};

export const hideMessage = () => {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = '';
};
