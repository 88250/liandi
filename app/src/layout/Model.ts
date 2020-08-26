import {Constants} from "../constants";
import {Tab} from "./Tab";

export class Model {
    public ws: WebSocket;
    public reqId: number;
    public parent: Tab

    constructor(options: {
        id: string,
        callback?: () => void
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
        ws.onclose = (ev: CloseEvent) => {
            if (0 > ev.reason.indexOf("close websocket")) {
                console.warn("WebSocket is closed. Reconnect will be attempted in 1 second.", ev);
                setTimeout(() => {
                    this.connect(id);
                }, 1000);
            }
        };
        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
            this.ws.close();
        };
        return ws;
    }

    public send(cmd: string, param: Record<string, unknown>, process = false) {
        this.reqId = process ? 0 : new Date().getTime();
        this.ws.send(JSON.stringify({
            cmd,
            reqId: this.reqId,
            param,
            // pushMode  0: 广播，1：单播(默认)，2：广播（不包含自己）
            // reloadPushMode 是否需要 reload  0: 广播，1：单播(默认)，2：广播（不包含自己）
        }));
    }
}
