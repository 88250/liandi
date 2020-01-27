import {Constants} from "../constants";

export class WebSocketUtil {
    public webSocket: WebSocket

    constructor(liandi: ILiandi) {
        this.webSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD)
        this.message(liandi)
    }

    private message(liandi: ILiandi) {
        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.cmd === 'opendir') {
                liandi.navigation.onmessage(liandi, data.data.url)
            }
        }
    }
}
