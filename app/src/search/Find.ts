import {EventEmitter} from 'events';
import {remote} from 'electron';

export class Find extends EventEmitter {
    private webContent: Electron.webContents;
    private inputElement: HTMLInputElement;
    private textElement: HTMLElement;

    constructor() {
        super();
        this.inputElement = document.querySelector('.find input') as HTMLInputElement;
        this.textElement = document.querySelector('.find__text') as HTMLElement;
        this.webContent = remote.getCurrentWindow().webContents;
        this.webContent.on('found-in-page', (event, result) => {
             this.textElement.innerHTML = `${result.activeMatchOrdinal}/${result.matches}`;
        });

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
            this.nextEvent();
        });
        this.inputElement.addEventListener('compositionend', () => {
            this.nextEvent();
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
        this.webContent.stopFindInPage('keepSelection');
        (document.querySelector('.find') as HTMLElement).style.display = 'none';
        (document.querySelector('.drag') as HTMLElement).style.marginRight = '96px';
    }

    private nextEvent(forward = true, findNext = false) {
        const text = this.inputElement.value;
        if (text.trim() === '') {
            this.webContent.stopFindInPage('keepSelection');
            this.textElement.innerText = '';
            return;
        }
        this.webContent.findInPage(text, {
            forward,
            findNext,
        });
    }

    open(key = '', index?: number) {
        const findElement = document.querySelector('.find') as HTMLElement;
        findElement.style.display = 'flex';
        this.inputElement.value = key;
        this.inputElement.focus();
        (document.querySelector('.drag') as HTMLElement).style.marginRight = '408px';

        if (typeof index === 'number') {
            for (let i = 0; i <= index; i++) {
                if (i === 0) {
                    this.nextEvent();
                } else {
                    this.nextEvent(true, true);
                }
            }
        }
    }
}
