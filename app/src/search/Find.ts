import {EventEmitter} from "events";

export class Find extends EventEmitter {
    private webContents: Electron.WebviewTag
    private inputElement: HTMLInputElement
    private textElement: HTMLElement

    constructor() {
        super();
        this.inputElement = document.querySelector('.find input') as HTMLInputElement;
        this.textElement = document.querySelector('.find__text') as HTMLElement;

        this.webContents = document.querySelector('.editors__webview') as Electron.WebviewTag
        this.webContents.addEventListener('found-in-page', (result) => {
            this.textElement.innerHTML = `${result.result.activeMatchOrdinal}/${result.result.matches}`;
        })

        this.inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.isComposing) {
                return;
            }
            if (event.key === 'Escape') {
                this.closeEvent();
                event.preventDefault();
            }
            if (event.key === 'Enter') {
                if (event.shiftKey) {
                    this.nextEvent(false, false);
                } else {
                    this.nextEvent(true, false);
                }
                event.preventDefault();
            }
        });
        this.inputElement.addEventListener('input', (event: InputEvent) => {
            if (event.isComposing) {
                return;
            }
            this.nextEvent()
        });
        this.inputElement.addEventListener('compositionend', () => {
            this.nextEvent()
        });

        document.querySelector('#findPrevious').addEventListener('click', () => {
            this.nextEvent(false, true);
        });

        document.querySelector('#findNext').addEventListener('click', () => {
            this.nextEvent(true, true);
        });

        document.querySelector('#findClose').addEventListener('click', () => {
            this.closeEvent();
        });
    }

    private closeEvent() {
        this.webContents.stopFindInPage('keepSelection');
        (document.querySelector('.find') as HTMLElement).style.display = 'none';
        (document.querySelector('.editors__drag') as HTMLElement).style.marginRight = '96px';
    };

    private nextEvent(forward = true, findNext = false) {
        const text = this.inputElement.value
        if (text.trim() === '') {
            this.webContents.stopFindInPage('keepSelection');
            this.textElement.innerText = '';
            return;
        }
        this.webContents.findInPage(text, {
            forward,
            findNext,
        })
    };

    open() {
        const findElement = document.querySelector('.find') as HTMLElement;
        findElement.style.display = 'flex';
        this.inputElement.value = '';
        this.inputElement.focus();
        (document.querySelector('.editors__drag') as HTMLElement).style.marginRight = '408px';
    }
}
