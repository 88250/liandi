import {Constants} from '../constants';
import {hideMessage, showMessage} from '../util/message';
import {destroyDialog, dialog} from '../util/dialog';
import {i18n} from '../i18n';
import {mountFile, mountWebDAV} from "../util/mount";

export class WebSocketUtil {
    public webSocket: WebSocket;
    private reqId: number
    private isFirst: boolean;

    constructor(liandi: ILiandi) {
        this.isFirst = true;
        this.connect(liandi);
    }

    public send(cmd: string, param: any) {
        this.reqId = new Date().getTime()
        this.webSocket.send(JSON.stringify({
            cmd,
            reqId: this.reqId,
            param,
        }))
    }

    private connect(liandi: ILiandi) {
        this.webSocket = new WebSocket(Constants.WEBSOCKET_ADDREDD);
        this.webSocket.onopen = () => {
            if (this.isFirst) {
                this.send('dirs', {})
            }
            this.isFirst = false;
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
                return
            }

            if (response.code !== 0) {
                showMessage(response.msg, 0);
                return;
            }
            switch (response.cmd) {
                case 'put':
                    showMessage(i18n[Constants.LANG].saveSuccess);
                    break
                case 'mount':
                case 'mountremote':
                    liandi.navigation.onMount(response.data);
                    hideMessage()
                    destroyDialog()
                    break;
                case 'ls':
                    liandi.files.onLs(liandi, response.data);
                    break;
                case 'get':
                    liandi.editors.onGet(liandi, response.data);
                    break;
                case 'dirs':
                    if (response.data.length === 0) {
                        dialog({
                            title: i18n[Constants.LANG].slogan,
                            content: `<div class="list__item">${i18n[Constants.LANG].mount}</div>
<div class="list__item">${i18n[Constants.LANG].mountWebDAV}</div>`,
                            width: 400
                        });

                        const listElement = document.querySelectorAll('#dialog .list__item');
                        listElement[0].addEventListener('click', () => {
                            mountFile(liandi);
                        });
                        listElement[1].addEventListener('click', () => {
                            mountWebDAV(liandi);
                        });
                        return;
                    }
                    liandi.navigation.element.innerHTML = '';
                    response.data.forEach((item: { url: string, remote: boolean }) => {
                        liandi.navigation.onMount(item);
                    });
                    break;
                case 'rename':
                    liandi.files.onRename(liandi, response.data);
                    break;
                case 'create':
                case 'remove':
                case 'mkdir':
                    window.liandi.liandi.ws.send('ls',  {
                            url: response.data.url,
                            path: response.data.path,
                        });
                    break;
            }
        };
    }
}
