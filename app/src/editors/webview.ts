import '../assets/scss/editor.scss';
import {Constants} from '../constants';
import {getPath, urlJoin} from '../util/path';
import {initGlobalKeyPress} from '../hotkey';
import {ipcRenderer, remote} from 'electron';

const {Menu, MenuItem} = remote
const Vditor = require('vditor');

export class EditorWebview {
    private vditor: any;
    private editorElement: HTMLElement;

    constructor() {
        this.editorElement = document.getElementById('liandiVditor');
        initGlobalKeyPress();
        this.onMessage();
        if (process.platform === 'win32') {
            document.body.classList.add('body--win32')
        }

        const menu = new Menu()
        const win = remote.getCurrentWindow()
        menu.append(new MenuItem({
            label: 'Copy',
            id: 'menuItemCopy',
            role: 'copy',
        }))
        menu.append(new MenuItem({
            label: 'Paste',
            id: 'menuItemPaste',
            role: 'paste',
        }))
        this.editorElement.addEventListener('mousedown', event => {
            if (2 !== event.button) { // 仅绑定右键
                return
            }
            menu.popup({window: win, x: event.x, y: event.y})
        })
    }

    private onMessage() {
        ipcRenderer.on(Constants.LIANDI_EDITOR_OPEN, (event, data) => {
            this.onOpen(data);
            if (data.config.theme === 'dark') {
                document.body.classList.add('theme--dark')
            } else {
                document.body.classList.remove('theme--dark')
            }
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SETTHEME, (event, data) => {
            if (data.config.theme === 'dark') {
                document.body.classList.add('theme--dark')
            } else {
                document.body.classList.remove('theme--dark')
            }
            this.onOpen(data);
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_RELOAD, (event, data) => {
            this.onOpen(data);
        });
    }

    private onOpen(liandi: ILiandi, value: string = remote.getGlobal('liandiEditor').editorText) {
        this.editorElement.innerHTML = '';
        let timeoutId: number
        this.vditor = new Vditor('liandiVditor', {
            typewriterMode: true,
            toolbar: [
                'emoji',
                'headings',
                'bold',
                'italic',
                'link',
                '|',
                'list',
                'ordered-list',
                'check',
                '|',
                'quote',
                'line',
                'code',
                'inline-code',
                '|',
                'upload',
                'table',
                '|',
                'undo',
                'redo',
                '|',
                'wysiwyg',
                'both',
                'preview',
                'format',
                '|',
                {
                    name: 'fullscreen',
                    click: (isFullscreen: boolean) => {
                        if (isFullscreen) {
                            ipcRenderer.sendToHost(Constants.LIANDI_EDITOR_FULLSCREEN)
                            this.vditor.focus()
                            if (process.platform === 'darwin') {
                                (document.querySelector('.vditor-toolbar') as HTMLElement).style.paddingLeft = '70px'
                            }
                        } else {
                            ipcRenderer.sendToHost(Constants.LIANDI_EDITOR_RESTORE)
                            this.vditor.focus()
                            if (process.platform === 'darwin') {
                                (document.querySelector('.vditor-toolbar') as HTMLElement).style.paddingLeft = '0'
                            }
                        }
                    },
                },
                'devtools',
                'info',
                'help',
            ],
            tab: '/t',
            theme: liandi.config.theme === 'dark' ? 'dark' : 'classic',
            cache: false,
            cdn: '../node_modules/vditor',
            preview: {
                markdown: {
                    autoSpace: liandi.config.markdown.autoSpace,
                    chinesePunct: liandi.config.markdown.chinesePunct,
                    fixTermTypo: liandi.config.markdown.fixTermTypo
                },
                math: {
                    inlineDigit: liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker,
                    engine: liandi.config.markdown.mathEngine,
                },
                hljs: {
                    style: liandi.config.theme === 'dark' ? 'native' : 'github'
                }
            },
            upload: {
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').replace('/\\s/g', ''),
                url: Constants.UPLOAD_ADDRESS,
                file: (files: File[]) => {
                    this.vditor.vditor.options.upload.headers = {
                        'X-URL': encodeURIComponent(liandi.current.dir.url),
                        'X-PATH': encodeURIComponent(liandi.current.path),
                        'X-Mode': this.vditor.vditor.currentMode
                    };
                    return files
                }
            },
            after: () => {
                this.vditor.vditor.lute.SetLinkBase(urlJoin(liandi.current.dir.url, getPath(liandi.current.path)));
                this.vditor.setValue(value);
                remote.getGlobal('liandiEditor').editorText = value
                remote.getGlobal('liandiEditor').saved = true
            },
            input: (value: string) => {
                remote.getGlobal('liandiEditor').editorText = value
                remote.getGlobal('liandiEditor').saved = false
                clearTimeout(timeoutId);
                timeoutId = window.setTimeout(() => {
                    ipcRenderer.sendToHost(Constants.LIANDI_WEBSOCKET_PUT)
                }, 5000);
            }
        });
    }
}

const editor = new EditorWebview();
