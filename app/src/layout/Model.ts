import {Constants} from "../constants";

export class Model {
    public ws: WebSocket;
    public reqId: number;

    constructor(options: {
        id: string,
        callback: () => void
    }) {
        this.ws = this.connect(options.id, options.callback);
    }

    private connect(id: string, callback?: () => void) {
        const ws = new WebSocket(`${Constants.WEBSOCKET_ADDREDD}?id=${id}`);
        ws.onopen = () => {
            if (callback) {
                callback.call(this);
            }
        };
        ws.onclose = (e) => {
            console.warn("WebSocket is closed. Reconnect will be attempted in 1 second.", e);
            setTimeout(() => {
                this.connect(id);
            }, 1000);
        };
        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
            this.ws.close();
        };
        return ws
    }

    public send(cmd: string, param: Record<string, unknown>, process = false) {
        this.reqId = process ? 0 : new Date().getTime();
        this.ws.send(JSON.stringify({
            cmd,
            reqId: this.reqId,
            param,
        }));
    }
}
