import {Constants} from '../constants';
import {hideMessage, showMessage} from '../util/message';
import {destroyDialog, dialog} from '../util/dialog';
import {i18n} from '../i18n';
import {showMountDialog} from '../util/mount';
import {lauguage} from '../config/language';
import {theme} from '../config/theme';
import {onSearch} from '../search';
import {markdown} from '../config/markdown';
import {image} from '../config/image';

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
            if ('msg' === response.cmd) {
                showMessage(response.msg, response.data.closeTimeout);
                return;
            }

            if (response.reqId !== this.reqId) {
                return;
            }

            if (response.code !== 0) {
                showMessage(response.msg, 0);
                return;
            }
            switch (response.cmd) {
                case 'search':
                    onSearch(liandi, response.data);
                    break;
                case 'searchblock':
                    liandi.editors.showSearchBlock(liandi, response.data);
                    break;
                case 'setimage':
                    image.onSetimage(liandi, response.data);
                    break;
                case 'setlang':
                    lauguage.onSetlang();
                    break;
                case 'setmd':
                    markdown.onSetMD(liandi, response.data);
                    break;
                case 'settheme':
                    theme.onSetTheme(liandi, response.data);
                    break;
                case 'getconf':
                    if (this.isFirst) {
                        liandi.config = response.data;
                    }

                    if (!liandi.config.lang) {
                        dialog({
                            hideBackground: true,
                            content: `<select class="input">
    <option value="en_US" selected>English</option>
    <option value="zh_CN">简体中文</option>
</select>`,
                            width: 400,
                            height: 60,
                            destroyDialogCallback: () => {
                                liandi.ws.send('setlang', {
                                    lang: 'en_US'
                                });
                            }
                        });
                        document.querySelector('select').addEventListener('change', (selectEvent) => {
                            liandi.ws.send('setlang', {
                                lang: (selectEvent.target as HTMLSelectElement).value
                            });
                        });
                        return;
                    }

                    if (this.isFirst) {
                        document.title = i18n[liandi.config.lang || 'en_US'].slogan;
                        callback();
                        theme.onSetTheme(liandi, response.data.theme);
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
                    liandi.navigation.onLs(liandi, response.data);
                    break;
                case 'get':
                    liandi.editors.open(liandi, response.data);
                    break;
                case 'searchget':
                    liandi.editors.open(liandi, response.data);
                    liandi.find.open(response.data.key, parseInt(response.data.index, 10));
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
                    liandi.navigation.onRename(liandi, response.data);
                    break;
                case 'create':
                    liandi.editors.open(liandi, {content: '', name: response.data.name});
                    break;
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
