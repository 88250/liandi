import {Constants} from "../constants";


export const initWebSocket = () => {
    return new Promise((resolve) => {
        window.ldWebSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD)

        window.ldWebSocket.onopen = () => {
            resolve()
        }
    })
}

