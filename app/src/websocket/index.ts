import {Constants} from '../constants';
import {hideMessage, showMessage} from '../util/message';
import {destroyDialog} from '../util/dialog';
import {i18n} from '../i18n';
import {showMountDialog} from '../util/mount';
import {lauguage} from '../config/language';
import {theme} from "../config/theme";

export class WebSocketUtil {
    public webSocket: WebSocket;
    private reqId: number;
    private isFirst: boolean;

    constructor(liandi: ILiandi, callback: () => void) {
        this.isFirst = true;
        this.connect(liandi, callback);
    }

    public send(cmd: string, param: any, process = false) {
        this.reqId = process ? 0 : new Date().getTime();
        this.webSocket.send(JSON.stringify({
            cmd,
            reqId: this.reqId,
            param,
        }));
    }

    private connect(liandi: ILiandi, callback?: () => void) {
        this.webSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD);
        this.webSocket.onopen = () => {
            if (this.isFirst) {
                this.send('getconf', {});
            }
        };
        this.webSocket.onclose = (e) => {
            console.warn('WebSocket is closed. Reconnect will be attempted in 1 second.', e);
            setTimeout(() => {
                this.connect(liandi);
            }, 1000);
        };
        this.webSocket.onerror = (err) => {
            console.error('WebSocket Error:', err);
            this.webSocket.close();
        };
        this.webSocket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.reqId !== this.reqId) {
                return;
            }

            if (response.code !== 0) {
                showMessage(response.msg, 0);
                return;
            }
            switch (response.cmd) {
                case 'setlang':
                    lauguage.onSetlang();
                    break;
                case 'settheme':
                    theme.onSettheme(liandi, response.data);
                    break;
                case 'getconf':
                    if (this.isFirst) {
                        liandi.config = response.data;
                        document.title = i18n[liandi.config.lang].slogan
                        callback();
                        this.isFirst = false;
                    }
                    if (response.data.dirs.length === 0) {
                        showMountDialog(liandi);
                        return;
                    }
                    liandi.navigation.element.innerHTML = '';
                    response.data.dirs.map((item: IDir) => {
                        liandi.navigation.onMount({dir: item});
                    });
                    break;
                case 'put':
                    showMessage(i18n[liandi.config.lang].saveSuccess);
                    liandi.editors.saved = true;
                    break;
                case 'lsd':
                    liandi.navigation.onLsd(liandi, response.data);
                    break;
                case 'unmount':
                    if (liandi.navigation.element.querySelectorAll('tree-list').length === 0) {
                        showMountDialog(liandi);
                    }
                    break;
                case 'mount':
                case 'mountremote':
                    this.send('dirs', {});
                    hideMessage();
                    destroyDialog();
                    break;
                case 'ls':
                    liandi.files.onLs(liandi, response.data);
                    break;
                case 'get':
                    liandi.editors.onGet(liandi, response.data);
                    break;
                case 'dirs':
                    if (response.data.length === 0) {
                        showMountDialog(liandi);
                        return;
                    }
                    liandi.navigation.element.innerHTML = '';
                    response.data.map((item: { dir: IDir }) => {
                        liandi.navigation.onMount(item);
                    });
                    break;
                case 'rename':
                    liandi.files.onRename(liandi, response.data);
                    break;
                case 'create':
                case 'remove':
                case 'mkdir':
                    window.liandi.liandi.ws.send('ls', {
                        url: response.data.url,
                        path: response.data.path,
                    });
                    break;
            }
        };
    }
}
