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

            this.initWindow();
            this.onIpc();
        });

        // 开发环境打开 editor 调试窗口
        if (process.env.NODE_ENV === 'development') {
            const editorWebview = document.querySelector('.editors__webview') as Electron.WebviewTag;
            editorWebview.addEventListener('dom-ready', () => {
                editorWebview.openDevTools();
                this.liandi.editors.sendMessage(Constants.LIANDI_EDITOR_INIT, this.liandi);
            });

            // 在编辑器内打开链接的处理
            editorWebview.addEventListener('will-navigate', e => {
                console.log(e)
                e.preventDefault();
                editorWebview.stop();
                editorWebview.getWebContents().stop();
                shell.openExternal(e.url);
            });

            editorWebview.addEventListener('new-window', e => {
                console.log(e)
                e.preventDefault();
                editorWebview.stop();
                editorWebview.getWebContents().stop();
                shell.openExternal(e.url);
            })
        }
    }

    private onIpc() {
        ipcRenderer.on(Constants.LIANDI_FIND_SHOW, () => {
            this.liandi.find.open();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            this.liandi.editors.sendMessage(Constants.LIANDI_EDITOR_SAVE);
        });
        ipcRenderer.on(Constants.LIANDI_SEARCH_OPEN, () => {
            initSearch(this.liandi);
        });
    }

    private initWindow() {
        const currentWindow = remote.getCurrentWindow();

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
