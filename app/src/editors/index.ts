const Vditor = require('vditor');

export class Editors {
    private element: HTMLElement;
    private editorElement: HTMLElement;
    private inputElement: HTMLInputElement;
    private vditor: any

    constructor() {
        this.element = document.getElementById('editors');
        this.inputElement = document.createElement('input')
        this.inputElement.className = 'editors__input'
        this.editorElement = document.createElement('div')
        this.editorElement.id = 'liandiVditor'
        this.editorElement.className = 'fn__flex-1'
    }

    refresh() {
        this.element.appendChild(this.inputElement)
        this.element.appendChild(this.editorElement)
    }

    remove() {
        this.element.innerHTML = ''
        this.editorElement.innerHTML = ''
    }

    save(liandi: ILiandi) {
        liandi.ws.webSocket.send(JSON.stringify({
            cmd: 'put',
            param: {
                url: liandi.editors.url,
                path: liandi.editors.path,
                content: this.vditor.getText()
            },
        }));
    }

    onGet(liandi: ILiandi, context: string) {
        if (this.element.innerHTML === "") {
            this.refresh()
        }

        if (this.editorElement.innerHTML !== "") {
            this.vditor.setValue(context);
        } else {
            let timeoutId: number;
            const vditor = new Vditor('liandiVditor', {
                cache: false,
                input: () => {
                    clearTimeout(timeoutId);
                    timeoutId = window.setTimeout(() => {
                        this.save(liandi);
                    }, 5000);
                },
                after() {
                    vditor.setValue(context);
                }
            });

            this.vditor = vditor;
        }
    }
}
