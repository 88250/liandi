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
import {remote, ipcRenderer} from 'electron';

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

            this.initWindow();
        });
        this.initFind()
    }

    initFind() {
        const inputElement = document.querySelector('.find input') as HTMLInputElement
        const previousElement = document.querySelector('#findPrevious') as HTMLElement
        const nextElement = document.querySelector('#findNext') as HTMLElement
        const closeElement = document.querySelector('#findClose') as HTMLElement
        const textElement = document.querySelector('.find__text') as HTMLElement
        inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.isComposing) {
                return
            }
            if (event.key === 'Escape') {
                closeElement.click()
            }
            if (event.key === 'Enter') {
                nextElement.click()
            }
        });
        inputElement.addEventListener('compositionend', () => {
            inputElement.type = 'password'
            ipcRenderer.send('liandi_find_text', {
                key: inputElement.value,
                findNext: false,
                forward: true,
            });
        });
        inputElement.addEventListener('input', (event: InputEvent) => {
            if (event.isComposing) {
                return
            }
            if (inputElement.value.trim() === '') {
                ipcRenderer.send('liandi_find_clear');
                textElement.innerText = ''
                return;
            }
            inputElement.type = 'password'
            ipcRenderer.send('liandi_find_text', {
                key: inputElement.value,
                forward: true,
                findNext: false,
            });
        })

        previousElement.addEventListener('click', () => {
            inputElement.type = 'password'
            ipcRenderer.send('liandi_find_text', {
                key: inputElement.value,
                forward: false,
                findNext: true,
            });
        })

        nextElement.addEventListener('click', () => {
            inputElement.type = 'password'
            ipcRenderer.send('liandi_find_text', {
                key: inputElement.value,
                forward: true,
                findNext: true,
            });
        })

        closeElement.addEventListener('click', () => {
            ipcRenderer.send('liandi_find_clear');
            (document.querySelector('.find') as HTMLElement).style.display = 'none'
        })

        ipcRenderer.on('liandi_find_result', (event, message) => {
            inputElement.type = 'text';
            inputElement.focus();
            textElement.innerHTML = `${message.activeMatchOrdinal}/${message.matches}`
            console.log(message)
        })
    }

    initWindow() {
        const currentWindow = remote.getCurrentWindow();
        document.querySelector('.editors__drag').addEventListener('dblclick', event => {
            if (currentWindow.isMaximized()) {
                currentWindow.setSize(1024, 768);
            } else {
                currentWindow.maximize();
            }
        });

        if (process.platform !== 'win32') {
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
