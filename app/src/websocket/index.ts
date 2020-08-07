import {Constants} from '../constants';
import {hideMessage, showMessage} from '../util/message';
import {destroyDialog, dialog} from '../util/dialog';
import {i18n} from '../i18n';
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
                        liandi.navigation.hide();
                        return;
                    }

                    liandi.navigation.element.innerHTML = '';
                    response.data.dirs.map((item: IDir) => {
                        liandi.navigation.onMount(liandi, {dir: item});
                    });
                    break;
                case 'put':
                    showMessage(i18n[liandi.config.lang].saveSuccess);
                    liandi.backlinks.onBacklinks(response.data.backlinks);
                    break;
                case 'unmount':
                    if (liandi.navigation.element.querySelectorAll('tree-list').length === 0) {
                        liandi.navigation.hide();
                    }
                    break;
                case 'mount':
                case 'mountremote':
                    this.send('dirs', {});
                    hideMessage();
                    destroyDialog();
                    liandi.navigation.show();
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
                        liandi.navigation.hide();
                        return;
                    }
                    liandi.navigation.element.innerHTML = '';
                    response.data.map((item: { dir: IDir }) => {
                        liandi.navigation.onMount(liandi, item);
                    });
                    break;
                case 'rename':
                    liandi.navigation.onRename(liandi, response.data);
                    break;
                case 'create':
                    const fileElement = liandi.menus.itemData.target
                    fileElement.insertAdjacentHTML("afterend", `<li style="${fileElement.getAttribute("style")}" data-type="navigation-file" class="item__name--md item__name fn__a" data-path="${encodeURIComponent(
                        response.data.path)}">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconMD"></use></svg>
<span class="fn__ellipsis">${response.data.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></li>`)
                    break;
                case 'remove':
                    // TODO
                    break;
                case 'mkdir':
                    const folderItemData = liandi.menus.itemData
                    folderItemData.target.insertAdjacentHTML("afterend", `<li style="${folderItemData.target.getAttribute("style")}" data-path="${encodeURIComponent(response.data.path)}" data-type="navigation-folder" class="fn__a fn__flex">
<svg class="item__arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="item__name">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#${folderItemData.dir.path !== '' ? 'iconCloud' : 'iconFolder'}"></use></svg>
  <span class="fn__ellipsis">${response.data.name}</span>
</span>
</li>`)
                    break;
            }
        };
    }
}
