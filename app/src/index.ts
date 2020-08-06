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
import {initSearch} from './search';
import {Backlinks} from './backlinks';

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
            this.liandi.navigation = new Navigation(this.liandi);
            this.liandi.editors = new Editors();
            this.liandi.menus = new Menus(this.liandi);
            this.liandi.find = new Find();
            this.liandi.backlinks = new Backlinks();

            resize('resize');
            resize('resize2', true);

            initGlobalKeyPress(this.liandi);

            this.onIpc();
            this.initWindow();
            this.initBar();
        });
    }

    private initBar() {
        document.getElementById('barNavigation').addEventListener('click', () => {
            if (this.liandi.navigation.element.classList.contains('fn__none')) {
                this.liandi.navigation.show()
            } else {
                this.liandi.navigation.hide()
            }
            window.dispatchEvent(new CustomEvent('resize'));
        });
        document.getElementById('barBacklinks').addEventListener('click', () => {
            if (this.liandi.backlinks.element.classList.contains('fn__none')) {
                this.liandi.backlinks.element.classList.remove('fn__none');
                document.getElementById('resize2').classList.remove('fn__none');
            } else {
                this.liandi.backlinks.element.classList.add('fn__none');
                document.getElementById('resize2').classList.add('fn__none');
            }
            window.dispatchEvent(new CustomEvent('resize'));
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

window.liandi = new App();
