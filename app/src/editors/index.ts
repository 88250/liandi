import {hideMessage, showMessage} from '../util/message';
import {i18n} from "../i18n";
import {Constants} from "../constants";
import {rename} from "../util/rename";

const Vditor = require('vditor');

export class Editors {
    public path: string
    public url: string;
    public inputWrapElement: HTMLElement;
    private element: HTMLElement;
    private editorElement: HTMLElement;
    private vditor: any;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('editors');
        this.inputWrapElement = document.createElement('div');
        this.inputWrapElement.className = 'fn__flex';
        this.inputWrapElement.innerHTML = `<input class="editors__input fn__flex-1"><button>${i18n[Constants.LANG].save}</button>`;
        this.inputWrapElement.querySelector('button').addEventListener('click', () => {
            this.saveContent(liandi);
        });

        this.inputWrapElement.querySelector('input').addEventListener('input', () => {
            rename(this.inputWrapElement.querySelector('input').value, this.url, this.path)
        });

        this.editorElement = document.createElement('div');
        this.editorElement.id = 'liandiVditor';
        this.editorElement.className = 'fn__flex-1';
    }

    remove(liandi: ILiandi) {
        this.saveContent(liandi);
        this.element.innerHTML = '';
    }

    private saveContent(liandi: ILiandi) {
        if (this.element.innerHTML === "") {
            return;
        }
        liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'put',
            param: {
                url: this.url,
                path: this.path,
                content: this.vditor.getValue()
            },
        }));
        showMessage(i18n[Constants.LANG].saveSuccess);
    }

    onGet(liandi: ILiandi, file: { content: string, name: string }) {
        if (this.element.innerHTML === '') {
            this.element.appendChild(this.inputWrapElement);
            this.element.appendChild(this.editorElement);
        }

        this.inputWrapElement.querySelector('input').value = file.name;

        if (this.editorElement.innerHTML !== '') {
            this.vditor.setValue(file.content);
        } else {
            let timeoutId: number;
            this.vditor = new Vditor('liandiVditor', {
                cache: false,
                value: file.content,
                input: () => {
                    clearTimeout(timeoutId);
                    timeoutId = window.setTimeout(() => {
                        this.saveContent(liandi);
                    }, 5000);
                }
            });
        }
    }
}
