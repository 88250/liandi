import {showMessage} from "../util/message";

const Vditor = require('vditor');

export class Editors {
    private element: HTMLElement;
    private editorElement: HTMLElement;
    private inputWrapElement: HTMLElement;
    private vditor: any

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('editors');
        this.inputWrapElement = document.createElement("div")
        this.inputWrapElement.className = "fn__flex"
        this.inputWrapElement.innerHTML = '<input class="editors__input fn__flex-1"><button>Save</button>';
        this.inputWrapElement.querySelector('button').addEventListener('click', () => {
            this.saveContent(liandi)
        })

        this.inputWrapElement.querySelector('input').addEventListener('input', () => {
            const oldName = liandi.editors.path.split('/').pop()
            const name = this.inputWrapElement.querySelector('input').value
            if (name === oldName) {
                return
            }

            window.liandi.liandi.ws.webSocket.send(JSON.stringify({
                cmd: 'rename',
                param: {
                    url: liandi.editors.url,
                    oldPath: liandi.editors.path,
                    newPath: liandi.editors.path.replace(oldName, '') + name
                },
            }))
        })

        this.editorElement = document.createElement('div')
        this.editorElement.id = 'liandiVditor'
        this.editorElement.className = 'fn__flex-1'
    }


    remove(liandi: ILiandi) {
        this.saveContent(liandi);
        this.element.innerHTML = ''
        this.editorElement.innerHTML = ''
    }

    private saveContent(liandi: ILiandi) {
        if (!this.vditor) {
            return
        }
        liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'put',
            param: {
                url: liandi.editors.url,
                path: liandi.editors.path,
                content: this.vditor.getValue()
            },
        }));
        showMessage("save success")
    }

    onGet(liandi: ILiandi, file: { content: string, name: string }) {
        if (this.element.innerHTML === "") {
            this.element.appendChild(this.inputWrapElement)
            this.element.appendChild(this.editorElement)
        }

        this.inputWrapElement.querySelector('input').value = file.name
        if (this.editorElement.innerHTML !== "") {
            this.vditor.setValue(file.content);
        } else {
            let timeoutId: number;
            const vditor = new Vditor('liandiVditor', {
                cache: false,
                input: () => {
                    clearTimeout(timeoutId);
                    timeoutId = window.setTimeout(() => {
                        this.saveContent(liandi);
                    }, 5000);
                },
                after() {
                    vditor.setValue(file.content);
                }
            });

            this.vditor = vditor;
        }
    }
}
