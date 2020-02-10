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
import {remote} from 'electron';

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

            resize('resize');
            resize('resize2');

            initGlobalKeyPress(this.liandi);
        });

        this.initWindow();
    }

    initWindow() {
        if (process.platform !== 'win32') {
            document.querySelectorAll('.window-controls__item').forEach((item:HTMLElement) => {
                item.style.display = 'none'
            })
            return;
        }
        const currentWindow = remote.getCurrentWindow();
        const maxBtnElement = document.getElementById('maxWindow');
        const restoreBtnElement = document.getElementById('restoreWindow');

        document.querySelector('.window-controls .fn__flex-1').addEventListener('dblclick', event => {
            if (currentWindow.isMaximized()) {
                currentWindow.setSize(1024, 768);
            } else {
                currentWindow.maximize();
            }
        });

        document.getElementById('minWindow').addEventListener('click', event => {
            currentWindow.minimize();
        });

        maxBtnElement.addEventListener('click', event => {
            currentWindow.maximize();
        });

        restoreBtnElement.addEventListener('click', event => {
            currentWindow.unmaximize();
        });

        document.getElementById('closeWindow').addEventListener('click', event => {
            currentWindow.close();
        });

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
