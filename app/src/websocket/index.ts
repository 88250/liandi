import {Constants} from "../constants";

export class WebSocketUtil {
    public webSocket: WebSocket

    constructor(liandi: ILiandi) {
        this.webSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD)
        this.webSocket.onopen = () => {
            liandi.ws.webSocket.send(JSON.stringify({
                cmd: 'dirs',
                param: {},
            }))
        }
        this.message(liandi)
    }

    private message(liandi: ILiandi) {
        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            switch (data.cmd) {
                case 'mount':
                    liandi.navigation.onMount(liandi, data.data.url)
                    break
                case 'ls':
                    liandi.files.onLs(liandi, data.data)
                    break
                case 'get':
                    liandi.editors.onGet(liandi, data.data)
                    break
                case 'dirs':
                    data.data.forEach((url: string) => {
                        liandi.navigation.onMount(liandi, url)
                    })
                    break
            }
        }
    }
}
