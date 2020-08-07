import {Constants} from '../constants';
import {showMessage} from '../util/message';
import {destroyDialog} from '../util/dialog';
import {i18n} from '../i18n';
import {theme} from '../config/theme';
import {onSearch} from '../search';
import {markdown} from '../config/markdown';
import {image} from '../config/image';
import {escapeHtml} from "../util/compatibility";
import {lauguage} from "../config/language";

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
                    window.location.reload();
                    break;
                case 'setmd':
                    markdown.onSetMD(liandi, response.data);
                    break;
                case 'settheme':
                    theme.onSetTheme(liandi, response.data);
                    break;
                case 'getconf':
                    liandi.config = Object.assign({
                        lang: 'zh_CN'
                    }, response.data);
                    document.title = i18n[liandi.config.lang].slogan;

                    callback();
                    theme.onSetTheme(liandi, response.data.theme);

                    if (response.data.dirs.length === 0) {
                        liandi.navigation.hide();
                    } else {
                        response.data.dirs.map((item: IDir) => {
                            liandi.navigation.onMount(liandi, {dir: item});
                        });
                    }
                    this.isFirst = false;
                    break;
                case 'put':
                    showMessage(i18n[liandi.config.lang].saveSuccess);
                    liandi.backlinks.getBacklinks(liandi);
                    break;
                case 'backlinks':
                    liandi.backlinks.onBacklinks(response.data.backlinks);
                    break;
                case 'mount':
                case 'mountremote':
                    destroyDialog();
                    liandi.navigation.onMount(liandi, response.data)
                    break;
                case 'ls':
                    liandi.navigation.onLs(liandi, response.data);
                    break;
                case 'get':
                    liandi.editors.onGet(liandi, response.data);
                    break;
                case 'searchget':
                    liandi.editors.onGet(liandi, response.data);
                    liandi.find.open(response.data.key, parseInt(response.data.index, 10));
                    break;
                case 'rename':
                    liandi.navigation.onRename(liandi, response.data);
                    break;
                case 'create':
                case 'mkdir':
                    const folderItemData = liandi.menus.itemData
                    folderItemData.target.firstElementChild.classList.remove("fn__hidden")
                    folderItemData.target.firstElementChild.classList.remove('item__arrow--open')
                    folderItemData.target.setAttribute('data-files', JSON.stringify(response.data.files));
                    liandi.navigation.getLeaf(folderItemData.target, response.data.dir);
                    destroyDialog();
                    break;
            }
        };
    }
}
