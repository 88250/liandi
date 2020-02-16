import {rename} from '../util/rename';
import {Constants} from "../constants";

export class Editors {
    public isOpen: boolean;
    private inputElement: HTMLInputElement
    private editorWebviewElement: Electron.WebviewTag;

    constructor(liandi: ILiandi) {
        this.isOpen = false
        const editorElement = document.getElementById('editors');

        this.inputElement = editorElement.querySelector('.editors__input') as HTMLInputElement;
        this.inputElement.addEventListener('blur', () => {
            rename(liandi, this.inputElement.value, liandi.current.dir.url, liandi.current.path);
        });

        this.editorWebviewElement = editorElement.querySelector('.editors__webview');
    }

    sendMessage(message: string, data?: any) {
        this.editorWebviewElement.send(message, data)
        if (message === Constants.LIANDI_EDITOR_OPEN) {
            this.inputElement.classList.remove('fn__none');
            this.editorWebviewElement.classList.remove('fn__none');
            this.inputElement.value = data.name
            this.isOpen = true
        }

        if (message === Constants.LIANDI_EDITOR_CLOSE) {
            this.inputElement.classList.add('fn__none');
            this.editorWebviewElement.classList.add('fn__none');
            this.isOpen = false
        }
    }
}
