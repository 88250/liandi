const Vditor = require("vditor")

export class Editors {
    public element: HTMLElement
    private vditor: any

    constructor() {
        this.element = document.getElementById('editors')
        this.vditor = undefined
    }

    onGet(liandi: ILiandi, context: string) {
        if (this.vditor) {
            this.vditor.setValue(context)
        } else {
            let timeoutId: number
            const vditor = new Vditor('editors', {
                cache: false,
                input(text: string) {
                    clearTimeout(timeoutId)
                    timeoutId = window.setTimeout(() => {
                        liandi.ws.webSocket.send(JSON.stringify({
                            cmd: 'put',
                            param: {
                                url: liandi.editors.url,
                                path: liandi.editors.path,
                                content: text
                            },
                        }))
                    }, 5000)
                },
                after() {
                    vditor.setValue(context)
                }
            })

            this.vditor = vditor
        }
    }
}
