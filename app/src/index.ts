import './assets/scss/base.scss';
import './components/tab-panel';
import './icons/index';
import {ipcRenderer, remote} from 'electron';
import {Constants} from './constants';
import {mountFile, mountWebDAV} from './util/mount';
import * as path from "path";
import {i18n} from "./i18n";
import {initSearch} from "./search";
import {Layout} from "./layout";
import {Wnd} from "./layout/wnd";
import {WebSocketUtil} from "./websocket";
import {Find} from "./search/Find";
import {doubleShift} from "./util/doubleShift";

class App {
    public liandi: ILiandi;

    constructor() {
        const layouts = [
            new Layout({size: "100px"}),
            new Layout({direction: 'lr', resize: 'tb'}),
            new Layout({size: "100px", resize: 'tb'}),
        ]
        layouts[1].children = [
            new Layout({parent: layouts[1], size: "25%"}),
            new Layout({parent: layouts[1], resize: 'lr'}),
            new Layout({parent: layouts[1], size: "25%", resize: 'lr'}),
        ];

        layouts[0].addChild(new Wnd({layout: layouts[0]}));
        (layouts[1].children[0] as Layout).addChild(new Wnd({layout: layouts[1].children[0] as Layout}));
        (layouts[1].children[2] as Layout).addChild(new Wnd({layout: layouts[1].children[2] as Layout}));
        layouts[2].addChild(new Wnd({layout: layouts[2]}));
        this.liandi = {
            layouts
        };
        this.liandi.ws = new WebSocketUtil(this.liandi, () => {
            //     this.liandi.navigation = new Navigation(this.liandi);
            //     this.liandi.editors = new Editors();
            //     this.liandi.menus = new Menus(this.liandi);
            this.liandi.find = new Find();
            //     this.liandi.backlinks = new Backlinks(this.liandi);
            //     this.liandi.graph = new Graph(this.liandi);
            doubleShift();
            //
            this.onIpc();
            this.initBar();
            (layouts[1].children[1] as Layout).addChild(new Wnd({
                layout: layouts[1].children[1] as Layout,
                html: `<div>
                    <div class="item fn__flex-inline">${i18n[this.liandi.config.lang].search}/${i18n[this.liandi.config.lang].config} &lt;Double Shift></div>
                    <div class="item fn__a fn__pointer" id="editorEmptyMount">${i18n[this.liandi.config.lang].mount}</div>
                    <div class="item fn__a fn__pointer" id="editorEmptyMountDAV">${i18n[this.liandi.config.lang].mountWebDAV}</div>
                </div>`
            }));
            this.initWindow();

            //     window.onresize = () => {
            //         this.liandi.graph.resize();
            //         this.liandi.editors.resize();
            //     };


            // document.getElementById('editorEmptyMount').addEventListener('click', () => {
            //     mountFile(this.liandi);
            // });
            // document.getElementById('editorEmptyMountDAV').addEventListener('click', () => {
            //     mountWebDAV(this.liandi);
            // });
        });
        window.liandi = this.liandi;
    }

    private initBar() {
        const liandi = this.liandi
        document.querySelector('.toolbar').innerHTML = `<div id="barNavigation" class="item fn__a">
            <svg>
                <use xlink:href="#iconFolder"></use>
            </svg>
            ${i18n[liandi.config.lang].fileTree}
        </div>
        <div id="barBacklinks" class="item fn__a">
            <svg>
                <use xlink:href="#iconLink"></use>
            </svg>${i18n[liandi.config.lang].backlinks}
        </div>
        <div id="barGraph" class="item fn__a">
            <svg>
                <use xlink:href="#iconGraph"></use>
            </svg>${i18n[liandi.config.lang].graphView}
        </div>
        <div class="fn__flex-1" id="drag"></div>
        <a href="https://hacpai.com/sponsor" class="item ft__pink">
            <svg>
                <use xlink:href="#iconFavorite"></use>
            </svg>${i18n[liandi.config.lang].sponsor}
        </a>
        <div id="barHelp" class="item fn__a">
            <svg>
                <use xlink:href="#iconHelp"></use>
            </svg>${i18n[liandi.config.lang].help}
        </div>
        <div id="barBug" class="item fn__a">
            <svg>
                <use xlink:href="#iconBug"></use>
            </svg>${i18n[liandi.config.lang].debug}
        </div>
        <div id="barSettings" class="item fn__a">
            <svg>
                <use xlink:href="#iconSettings"></use>
            </svg>${i18n[liandi.config.lang].config}
        </div>`
        document.getElementById('barNavigation').addEventListener('click', function () {
            if (this.classList.contains("item--current")) {
                liandi.navigation.hide()
            } else {
                liandi.navigation.show()
            }
            window.dispatchEvent(new CustomEvent('resize'));
        });
        // document.getElementById('barGraph').addEventListener('click', function () {
        //     if (this.classList.contains("item--current")) {
        //         liandi.graph.hide(liandi);
        //     } else {
        //         liandi.graph.show(liandi)
        //     }
        //     window.dispatchEvent(new CustomEvent('resize'));
        // });
        // document.getElementById('barBacklinks').addEventListener('click', function () {
        //     if (this.classList.contains('item--current')) {
        //         liandi.backlinks.hide(liandi);
        //     } else {
        //         liandi.backlinks.show(liandi);
        //     }
        //     window.dispatchEvent(new CustomEvent('resize'));
        // });
        // document.getElementById('barHelp').addEventListener('click', function () {
        //     liandi.navigation.show();
        //     liandi.ws.send('mount', {
        //         url: `${Constants.WEBDAV_ADDRESS}/`,
        //         path: path.posix.join(Constants.APP_DIR, 'public/zh_CN/链滴笔记用户指南')
        //     });
        // });
        document.getElementById('barBug').addEventListener('click', function () {
            remote.getCurrentWindow().webContents.openDevTools({mode: 'bottom'})
        });
        document.getElementById('barSettings').addEventListener('click', () => {
            initSearch('settings');
        });
    }

    private onIpc() {
        // 监听主线程发送的消息
        ipcRenderer.on(Constants.LIANDI_FIND_SHOW, () => {
            this.liandi.find.open();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            // TODO this.liandi.editors.save(this.liandi);
        });
        ipcRenderer.on(Constants.LIANDI_FILE_NEW, () => {
            // TODO newFile(this.liandi)
        });
    }

    private initWindow() {
        // window action
        const currentWindow = remote.getCurrentWindow();
        if (process.platform === 'darwin') {
            document.getElementById('drag').addEventListener('dblclick', () => {
                if (currentWindow.isMaximized()) {
                    currentWindow.unmaximize();
                } else {
                    currentWindow.maximize();
                }
            });
            return;
        }

        if (process.platform === 'win32') {
            document.body.classList.add('body--win32');
        }

        currentWindow.on('blur', () => {
            document.body.classList.add('body--blur');
        });
        currentWindow.on('focus', () => {
            document.body.classList.remove('body--blur');
        });

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

new

App();
