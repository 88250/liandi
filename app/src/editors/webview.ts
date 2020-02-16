import '../assets/scss/editor.scss';
import {Constants} from '../constants';
import {getPath} from '../util/path';
import {initGlobalKeyPress} from '../hotkey';
import {ipcRenderer} from 'electron';

const Vditor = require('vditor');

export class EditorWebview {
    private vditor: any;
    private saved: boolean;
    private editorElement: HTMLElement;
    private timeoutId: number;

    constructor() {
        this.saved = true;
        this.editorElement = document.getElementById('liandiVditor');

        this.onMessage();
    }

    private onMessage() {
        ipcRenderer.on(Constants.LIANDI_EDITOR_INIT, () => {
            initGlobalKeyPress();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_OPEN, (event, data) => {
            this.onOpen(data.liandi, data.data.content);
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_CLOSE, () => {
            this.saveContent();
            this.editorElement.innerHTML = '';
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            this.saveContent();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SETTHEME, (event, data) => {
            this.vditor.setTheme(data);
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_RELOAD, (event, data) => {
            this.onOpen(data, this.vditor.getValue());
        });
    }

    private saveContent() {
        if (this.saved) {
            return;
        }
        if (this.editorElement.innerHTML === '') {
            return;
        }
        ipcRenderer.sendToHost(Constants.LIANDI_WEBSOCKET_PUT, this.vditor.getValue())
        this.saved = true;
    }

    private onOpen(liandi: ILiandi, value: string) {
        this.editorElement.innerHTML = '';
        const linkBase = liandi.current.dir.url + getPath(liandi.current.path);
        this.vditor = new Vditor('liandiVditor', {
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
                'record',
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
                        } else {
                            ipcRenderer.sendToHost(Constants.LIANDI_EDITOR_RESTORE)
                            this.vditor.focus()
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
            },
            value,
            upload: {
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').replace('/\\s/g', ''),
                url: Constants.UPLOAD_ADDRESS,
                headers: {
                    'X-URL': encodeURIComponent(liandi.current.dir.url),
                    'X-PATH': encodeURIComponent(liandi.current.path)
                }
            },
            after: () => {
                this.vditor.vditor.lute.SetLinkBase(linkBase);
                this.vditor.vditor.options.upload.headers = {
                    'X-URL': encodeURIComponent(liandi.current.dir.url),
                    'X-PATH': encodeURIComponent(liandi.current.path)
                };
            },
            input: () => {
                this.saved = false;
                clearTimeout(this.timeoutId);
                this.timeoutId = window.setTimeout(() => {
                    this.saveContent();
                }, 5000);
            }
        });
    }
}

const editor = new EditorWebview();
