import {Constants} from "../constants";

export class WebSocketUtil {
    public webSocket: WebSocket

    constructor(liandi: ILiandi) {
        this.connect(liandi)
    }

    private connect(liandi: ILiandi) {
        this.webSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD)
        this.webSocket.onopen = () => {
            liandi.ws.webSocket.send(JSON.stringify({
                cmd: 'dirs',
                param: {},
            }))
        }
        this.webSocket.onclose = (e) => {
            console.warn('WebSocket is closed. Reconnect will be attempted in 1 second.', e.reason);
            setTimeout(() => {
                this.connect(liandi);
            }, 1000);
        };
        this.webSocket.onerror = (err) => {
            console.error('WebSocket Error:', err);
            this.webSocket.close();
        };
        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            switch (data.cmd) {
                case 'mount':
                    liandi.navigation.onMount(liandi, data.data.url)
                    break;
                case 'ls':
                    liandi.files.onLs(liandi, data.data)
                    break;
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
