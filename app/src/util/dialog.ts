export const destroyDialog = (destroyDialogCallback?: () => void) => {
    const dialogElement =   document.getElementById('dialog');
    if (dialogElement) {
        dialogElement.remove();
    }
    if (destroyDialogCallback) {
        destroyDialogCallback();
    }
};

export const dialog = (options: {
    title: string,
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
      <div class="dialog__header" onselectstart="return false;">
          <h2></h2>
          <svg><use xlink:href="#iconClose"></use></svg>
      </div>
      <div class="dialog__content"></div>
    </div>
</div>`);
        document.querySelector('#dialog .dialog__header svg').addEventListener('click', () => {
            destroyDialog(options.destroyDialogCallback);
        });

        document.querySelector('#dialog .dialog__bg').addEventListener('click', () => {
            destroyDialog(options.destroyDialogCallback);
        });
        dialogElement = document.querySelector('#dialog') as HTMLElement;
    }

    dialogElement.querySelector('.dialog__header h2').innerHTML = options.title;
    dialogElement.querySelector('.dialog__content').innerHTML = options.content;
    const dialogMainElement = dialogElement.querySelector('.dialog__main') as HTMLElement;
    const dialogContentElement = dialogElement.querySelector('.dialog__content') as HTMLElement;
    if (options.height) {
        dialogMainElement.style.height = options.height + 'px';
        dialogContentElement.style.height = (options.height - 85) + 'px';
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
