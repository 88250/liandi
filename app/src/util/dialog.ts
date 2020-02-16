export const destroyDialog = (destroyDialogCallback?: () => void) => {
    const dialogElement = document.getElementById('dialog');
    if (dialogElement) {
        dialogElement.remove();
    }
    if (destroyDialogCallback) {
        destroyDialogCallback();
    }
};

export const dialog = (options: {
    title?: string,
    content: string,
    width: number
    height?: number,
    destroyDialogCallback?: () => void
}) => {
    let dialogElement = document.querySelector('#dialog') as HTMLElement;
    if (!dialogElement) {
        document.body.insertAdjacentHTML('beforeend', `
<div class="dialog" id="dialog">
    <div class="dialog__bg"></div>
    <div class="dialog__main fn__layer">
      <svg class="dialog__close"><use xlink:href="#iconClose"></use></svg>
      <div class="dialog__header" onselectstart="return false;">
      </div>
      <div class="dialog__content"></div>
    </div>
</div>`);
        document.querySelector('#dialog .dialog__close').addEventListener('click', () => {
            destroyDialog(options.destroyDialogCallback);
        });

        document.querySelector('#dialog .dialog__bg').addEventListener('click', () => {
            destroyDialog(options.destroyDialogCallback);
        });
        dialogElement = document.querySelector('#dialog') as HTMLElement;
    }

    const headerElement = dialogElement.querySelector('.dialog__header') as HTMLElement;
    if (options.title) {
        headerElement.innerHTML = `<h2>${options.title}</h2>`;
        headerElement.style.display = 'block';
    } else {
        headerElement.style.display = 'none';
    }
    dialogElement.querySelector('.dialog__content').innerHTML = options.content;
    const dialogMainElement = dialogElement.querySelector('.dialog__main') as HTMLElement;
    const dialogContentElement = dialogElement.querySelector('.dialog__content') as HTMLElement;
    if (options.height) {
        dialogMainElement.style.height = options.height + 'px';
        dialogContentElement.style.height = (options.height - (options.title ? 85 : 0)) + 'px';
    } else {
        dialogMainElement.style.height = 'auto';
        dialogContentElement.style.height = 'auto';
    }
    dialogMainElement.style.top = `${Math.max(0,
        (document.body.clientHeight - dialogMainElement.clientHeight) / 2)}px`;
    dialogMainElement.style.left = `${(document.body.clientWidth - options.width) / 2}px`;
    dialogMainElement.style.width = `${options.width}px`;
    dialogElement.style.display = 'block';
};

export const bindDialogInput = (inputElement: HTMLInputElement, enterEvent?: () => void) => {
    inputElement.focus();
    inputElement.addEventListener('keydown', (event) => {
        if (event.isComposing) {
            return;
        }
        if (event.key === 'Escape') {
            destroyDialog()
            event.preventDefault();
        }
        if (event.key === 'Enter' && enterEvent) {
            enterEvent()
            event.preventDefault();
        }
    })
}
