import './assets/scss/base.scss';
import {Navigation} from './navigation';
import {WebSocketUtil} from './websocket';
import './components/tab-panel';
import './icons/index';
import {Editors} from './editors';
import {Menus} from './menu';
import {resize} from './util/resize';
import {initGlobalKeyPress} from './hotkey';
import {ipcRenderer, remote} from 'electron';
import {Find} from './search/Find';
import {Constants} from './constants';
import {mountFile, mountWebDAV} from './util/mount';
import * as path from "path";
import {Backlinks} from './backlinks';
import {Graph} from "./graph";
import {i18n} from "./i18n";
import {initSearch} from "./search";

class App {
    public liandi: ILiandi;

    constructor() {
        this.liandi = {
            current: {
                path: '',
            },
        };

        this.liandi.ws = new WebSocketUtil(this.liandi, () => {
            this.liandi.navigation = new Navigation(this.liandi);
            this.liandi.editors = new Editors();
            this.liandi.menus = new Menus(this.liandi);
            this.liandi.find = new Find();
            this.liandi.backlinks = new Backlinks(this.liandi);
            this.liandi.graph = new Graph(this.liandi);

            resize('resize');
            resize('resize2', true);
            resize('resize3', true);

            initGlobalKeyPress(this.liandi);

            this.onIpc();
            this.initWindow();
            this.initBar();

            // 打开新窗口的处理
            remote.process.argv.forEach((item, index) => {
                if (item.indexOf("--liandi-url") === 0) {
                    this.liandi.current = {
                        dir: {
                            url: decodeURIComponent(remote.process.argv[index]).substr(13)
                        },
                        path: decodeURIComponent(remote.process.argv[index + 1]).substr(14)
                    }
                    this.liandi.navigation.hide()
                    this.liandi.backlinks.hide(this.liandi);
                    this.liandi.ws.send('get', {
                        url: this.liandi.current.dir.url,
                        path: this.liandi.current.path,
                    }, true)
                }
            });

            window.onresize = () => {
                this.liandi.graph.resize();
                this.liandi.editors.resize();
            };
        });

        window.liandi = this.liandi;
    }

    private initBar() {
        const liandi = this.liandi
        document.querySelector('.bar').innerHTML = `<div id="barNavigation" class="item vditor-tooltipped fn__a vditor-tooltipped__w item--current" aria-label="${i18n[liandi.config.lang].fileTree}">
            <svg>
                <use xlink:href="#iconFolder"></use>
            </svg>
        </div>
        <div id="barBacklinks" class="item vditor-tooltipped fn__a vditor-tooltipped__w" aria-label="${i18n[liandi.config.lang].backlinks}">
            <svg>
                <use xlink:href="#iconLink"></use>
            </svg>
        </div>
        <div id="barGraph" class="item vditor-tooltipped fn__a vditor-tooltipped__w" aria-label="${i18n[liandi.config.lang].graphView}">
            <svg>
                <use xlink:href="#iconGraph"></use>
            </svg>
        </div>
        <div class="fn__flex-1"></div>
        <a href="https://hacpai.com/sponsor" class="item vditor-tooltipped vditor-tooltipped__w ft__pink" aria-label="${i18n[liandi.config.lang].sponsor}">
            <svg>
                <use xlink:href="#iconFavorite"></use>
            </svg>
        </a>
        <div id="barHelp" class="item vditor-tooltipped fn__a vditor-tooltipped__w" aria-label="${i18n[liandi.config.lang].help}">
            <svg>
                <use xlink:href="#iconHelp"></use>
            </svg>
        </div>
        <div id="barSettings" class="item vditor-tooltipped fn__a vditor-tooltipped__w" aria-label="${i18n[liandi.config.lang].config} <Double Shift>">
            <svg>
                <use xlink:href="#iconSettings"></use>
            </svg>
        </div>`
        document.querySelector('.editor__empty').innerHTML = `<div>
                <div class="item fn__flex-inline">${i18n[liandi.config.lang].search}/${i18n[liandi.config.lang].config} &lt;Double Shift></div>
                <div class="item fn__a fn__pointer" id="editorEmptyMount">${i18n[liandi.config.lang].mount}</div>
                <div class="item fn__a fn__pointer" id="editorEmptyMountDAV">${i18n[liandi.config.lang].mountWebDAV}</div>
            </div>`
        document.getElementById('barNavigation').addEventListener('click', function () {
            if (this.classList.contains("item--current")) {
                liandi.navigation.hide()
            } else {
                liandi.navigation.show()
            }
            window.dispatchEvent(new CustomEvent('resize'));
        });
        document.getElementById('barGraph').addEventListener('click', function () {
            if (this.classList.contains("item--current")) {
                liandi.graph.hide(liandi);
            } else {
                liandi.graph.show(liandi)
            }
            window.dispatchEvent(new CustomEvent('resize'));
        });
        document.getElementById('barBacklinks').addEventListener('click', function () {
            if (this.classList.contains('item--current')) {
                liandi.backlinks.hide(liandi);
            } else {
                liandi.backlinks.show(liandi);
            }
            window.dispatchEvent(new CustomEvent('resize'));
        });
        document.getElementById('barHelp').addEventListener('click', function () {
            liandi.ws.send('mount', {
                url: `${Constants.WEBDAV_ADDRESS}/`,
                path: path.posix.join(Constants.APP_DIR, 'public/zh_CN/help')
            });
        });
        document.getElementById('barSettings').addEventListener('click', () => {
            initSearch(this.liandi, 'settings');
        });
        document.getElementById('editorEmptyMount').addEventListener('click', () => {
            mountFile(this.liandi);
        });
        document.getElementById('editorEmptyMountDAV').addEventListener('click', () => {
            mountWebDAV(this.liandi);
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
            document.querySelector('.drag').addEventListener('dblclick', () => {
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

        const maxBtnElement = document.getElementById('maxWindow');
        const restoreBtnElement = document.getElementById('restoreWindow');
        const minBtnElement = document.getElementById('minWindow');
        const closeBtnElement = document.getElementById('closeWindow');

        minBtnElement.addEventListener('click', () => {
            currentWindow.minimize();
        });
        minBtnElement.style.display = 'block';

        maxBtnElement.addEventListener('click', () => {
            currentWindow.maximize();
        });

        restoreBtnElement.addEventListener('click', () => {
            currentWindow.unmaximize();
        });

        closeBtnElement.addEventListener('click', () => {
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

new App();
