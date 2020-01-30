import {hideMessage, showMessage} from '../util/message';
import {i18n} from '../i18n';
import {Constants} from '../constants';
import {rename} from '../util/rename';

const Vditor = require('vditor');

export class Editors {
    public inputWrapElement: HTMLElement;
    public element: HTMLElement;
    private editorElement: HTMLElement;
    private vditor: any;
    private timeoutId: number;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('editors');
        this.inputWrapElement = document.createElement('div');
        this.inputWrapElement.className = 'fn__flex';
        this.inputWrapElement.innerHTML = `<input class="editors__input fn__flex-1"><button>${i18n[Constants.LANG].save}</button>`;
        this.inputWrapElement.querySelector('button').addEventListener('click', () => {
            this.saveContent(liandi);
        });

        this.inputWrapElement.querySelector('input').addEventListener('input', () => {
            rename(this.inputWrapElement.querySelector('input').value, liandi.current.url, liandi.current.path);
        });

        this.editorElement = document.createElement('div');
        this.editorElement.id = 'liandiVditor';
        this.editorElement.className = 'fn__flex-1';
    }

    remove(liandi: ILiandi) {
        clearTimeout(this.timeoutId);
        this.saveContent(liandi);
        this.element.innerHTML = '';
    }

    private saveContent(liandi: ILiandi) {
        if (this.element.innerHTML === '') {
            return;
        }
        liandi.ws.send( 'put',  {
                url: liandi.current.url,
                path: liandi.current.path,
                content: this.vditor.getValue()
            });
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

            this.vditor = new Vditor('liandiVditor', {
                cache: false,
                value: file.content,
                input: () => {
                    clearTimeout(this.timeoutId);
                    this.timeoutId = window.setTimeout(() => {
                        this.saveContent(liandi);
                    }, 5000);
                }
            });
        }
    }
}
