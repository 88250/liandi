import {rename} from '../util/rename';
import {remote} from 'electron';

export class Editors {
    private inputElement: HTMLInputElement;
    private editorWebviewElement: Electron.WebviewTag;

    constructor(liandi: ILiandi) {
        const editorElement = document.getElementById('editors');

        this.inputElement = editorElement.querySelector('.editors__input') as HTMLInputElement;
        this.inputElement.addEventListener('blur', () => {
            rename(liandi, this.inputElement.value, liandi.current.dir.url, liandi.current.path);
        });

        this.editorWebviewElement = editorElement.querySelector('.editors__webview');
    }

    save(liandi: ILiandi) {
        if (remote.getGlobal('liandiEditor').saved || !liandi.current.dir) {
            return;
        }
        liandi.ws.send('put', {
            url: liandi.current.dir.url,
            path: liandi.current.path,
            content: remote.getGlobal('liandiEditor').editorText
        });
        remote.getGlobal('liandiEditor').saved = true;
    }

    close(liandi: ILiandi) {
        this.save(liandi);
        this.inputElement.classList.add('fn__none');
        this.editorWebviewElement.classList.add('fn__none');
    }

    sendMessage(message: string, liandi: ILiandi, editorData?: { content: string, name: string }) {
        if (editorData) {
            remote.getGlobal('liandiEditor').editorText = editorData.content;
            this.inputElement.value = editorData.name.replace(".md", "");
            this.inputElement.classList.remove('fn__none');
            this.editorWebviewElement.classList.remove('fn__none');
        }
        this.editorWebviewElement.send(message, liandi);
    }
}
