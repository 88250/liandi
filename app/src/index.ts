import './assets/scss/base.scss';
import {Navigation} from './navigation';
import {Files} from './files';
import {WebSocketUtil} from './websocket';
import './components/file-item';
import './components/tree-list';
import './components/tab-panel';
import './icons/index';
import {Editors} from './editors';
import {Menus} from './menu';
import {resize} from './util/resize';
import {initGlobalKeyPress} from './hotkey';
import {ipcRenderer, remote, shell} from 'electron';
import {Find} from './search/Find';
import {Constants} from './constants';
import {initSearch} from './search';

class App {
    public liandi: ILiandi;

    constructor() {
        this.liandi = {
            current: {
                path: '',
            },
            componentCSS: require('../dist/components.css')[0][1]
        };

        this.liandi.ws = new WebSocketUtil(this.liandi, () => {
            this.liandi.navigation = new Navigation();
            this.liandi.files = new Files();
            this.liandi.editors = new Editors(this.liandi);
            this.liandi.menus = new Menus(this.liandi);
            this.liandi.find = new Find();

            resize('resize');
            resize('resize2');

            initGlobalKeyPress(this.liandi);

            this.onIpc();
            this.initWindow();
            this.initWebview();
        });
    }

    private initWebview() {
        const editorWebview = document.querySelector('.editors__webview') as Electron.WebviewTag;
        // 在编辑器内打开链接的处理
        editorWebview.addEventListener('will-navigate', e => {
            e.preventDefault();
            editorWebview.stop();
            editorWebview.getWebContents().stop();
            shell.openExternal(e.url);
        });

        // 监听 webview 发送过来的事件
        editorWebview.addEventListener('ipc-message', (event) => {
            switch (event.channel) {
                case Constants.LIANDI_EDITOR_FULLSCREEN:
                    editorWebview.classList.add('editors__webview--fullscreen');
                    break;
                case Constants.LIANDI_EDITOR_RESTORE:
                    editorWebview.classList.remove('editors__webview--fullscreen');
                    break;
                case Constants.LIANDI_WEBSOCKET_PUT:
                    this.liandi.editors.save(this.liandi);
                    break;
                case Constants.LIANDI_SEARCH_OPEN:
                    initSearch(this.liandi);
                    break;
                default:
                    break;
            }
        });
    }

    private onIpc() {
        // 监听主线程发送的消息
        ipcRenderer.on(Constants.LIANDI_FIND_SHOW, () => {
            this.liandi.find.open();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            this.liandi.editors.save(this.liandi);
        });
    }

    private initWindow() {
        const currentWindow = remote.getCurrentWindow();
        currentWindow.on('blur', () => {
            document.body.classList.add('body--blur');
        });

        currentWindow.on('focus', () => {
            document.body.classList.remove('body--blur');
        });


        // window action
        if (process.platform === 'darwin') {
            document.querySelector('.editors__drag').addEventListener('dblclick', () => {
                if (currentWindow.isMaximized()) {
                    currentWindow.setSize(1024, 768);
                } else {
                    currentWindow.maximize();
                }
            });
            return;
        }

        if (process.platform === 'win32') {
            document.body.classList.add('body--win32');
        }

        document.querySelector('.navigation').classList.add('navigation--win32');
        const maxBtnElement = document.getElementById('maxWindow');
        const restoreBtnElement = document.getElementById('restoreWindow');
        const minBtnElement = document.getElementById('minWindow');
        const closeBtnElement = document.getElementById('closeWindow');

        minBtnElement.addEventListener('click', event => {
            currentWindow.minimize();
        });
        minBtnElement.style.display = 'block';

        maxBtnElement.addEventListener('click', event => {
            currentWindow.maximize();
        });

        restoreBtnElement.addEventListener('click', event => {
            currentWindow.unmaximize();
        });

        closeBtnElement.addEventListener('click', event => {
            currentWindow.close();
        });
        closeBtnElement.style.display = 'block';

        const toggleMaxRestoreButtons = () => {
            if (currentWindow.isMaximized()) {
                restoreBtnElement.style.display = 'block';
                maxBtnElement.style.display = 'none';
            } else {
                restoreBtnElement.style.display = 'none';
                maxBtnElement.style.display = 'block';
            }
        };
        toggleMaxRestoreButtons();
        currentWindow.on('maximize', toggleMaxRestoreButtons);
        currentWindow.on('unmaximize', toggleMaxRestoreButtons);
    }
}

window.liandi = new App();
