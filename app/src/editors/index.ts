import {showMessage} from '../util/message';
import {i18n} from "../i18n";
import {Constants} from "../constants";

const Vditor = require('vditor');

export class Editors {
    private element: HTMLElement;
    private editorElement: HTMLElement;
    private inputWrapElement: HTMLElement;
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
            const name = this.inputWrapElement.querySelector('input').value;

            if (/\\|\/|\:|\*|\?|\"|<|>|\|/.test(name)) {
                showMessage(i18n[Constants.LANG].fileNameRule)
                return
            }
            const oldName = liandi.editors.path.split('/').pop();
            if (name === oldName) {
                return;
            }

            const newPath = liandi.editors.path.replace(oldName, '') + name;
            window.liandi.liandi.ws.webSocket.send(JSON.stringify({
                cmd: 'rename',
                param: {
                    url: liandi.editors.url,
                    oldPath: liandi.editors.path,
                    newPath
                },
            }));
            liandi.editors.path = newPath;

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
                url: liandi.editors.url,
                path: liandi.editors.path,
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
