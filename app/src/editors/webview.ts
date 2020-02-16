import {Constants} from '../constants';
import {getPath} from '../util/path';
import {initGlobalKeyPress} from "../hotkey";
import {ipcRenderer} from 'electron'

const Vditor = require('vditor');


export class EditorWebview {
    private vditor: any;
    private saved: boolean;
    private editorElement: HTMLElement;
    private timeoutId: number;
    private liandi: ILiandi;

    constructor() {
        this.saved = true;
        this.editorElement = document.getElementById('liandiVditor');

        this.onMessage()
    }

    onMessage() {
        ipcRenderer.on(Constants.LIANDI_EDITOR_INIT, (event, data) => {
            this.liandi = data;
            initGlobalKeyPress(data)
        })
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            console.log('save')
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_RELOAD, () => {
            console.log('save')
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SETTHEME, (event, data) => {
            this.vditor.setTheme('dark');
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_OPEN, (event, data) => {
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_CLOSE, (event, data) => {
        });
    }

    reload(liandi: ILiandi) {
        const content = this.vditor.getValue();
        this.onGet(liandi, {
            content,
            name
        });
    }

    remove(liandi: ILiandi) {
        clearTimeout(this.timeoutId);
        this.saveContent(liandi);
        // this.element.querySelector('#liandiVditor').remove();
    }

    public saveContent(liandi: ILiandi) {
        if (this.saved) {
            return;
        }
        if (this.editorElement.innerHTML === '') {
            return;
        }
        liandi.ws.send('put', {
            url: liandi.current.dir.url,
            path: liandi.current.path,
            content: this.vditor.getValue()
        });
        this.saved = true
    }

    onGet(liandi: ILiandi, file: { content: string, name: string }) {
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
                'fullscreen',
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
            value: file.content,
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
                    this.saveContent(liandi);
                }, 5000);
            }
        });
    }
}

new EditorWebview();
