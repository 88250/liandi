import {Constants} from '../constants';
import {rename} from '../util/rename';
import {getPath} from '../util/path';
import * as path from 'path';

const Vditor = require('vditor');

export class Editors {
    public inputElement: HTMLInputElement;
    public element: HTMLElement;
    public vditor: any;
    public saved: boolean;
    private editorElement: HTMLElement;
    private timeoutId: number;

    constructor(liandi: ILiandi) {
        this.saved = true;
        this.element = document.getElementById('editors');

        this.inputElement = document.createElement('input');
        this.inputElement.className ='editors__input';
        this.inputElement.addEventListener('blur', () => {
            rename(liandi, this.inputElement.value, liandi.current.dir.url, liandi.current.path);
        });

        this.editorElement = document.createElement('div');
        this.editorElement.id = 'liandiVditor';
        this.editorElement.className = 'fn__flex-1';
    }

    reload(liandi: ILiandi) {
        const content = this.vditor.getValue();
        const name = this.inputElement.value;
        this.remove(liandi);
        this.onGet(liandi, {
            content,
            name
        });
    }

    remove(liandi: ILiandi) {
        clearTimeout(this.timeoutId);
        this.saveContent(liandi);
        const inputElement = this.element.querySelector('.editors__input');
        if (inputElement) {
            this.element.querySelector('#liandiVditor').remove();
            this.element.querySelector('.editors__input').remove();
        }
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
    }

    onGet(liandi: ILiandi, file: { content: string, name: string }) {
        if (!this.element.querySelector('.editors__input')) {
            this.element.appendChild(this.inputElement);
            this.element.appendChild(this.editorElement);
        }
        this.editorElement.innerHTML = '';
        this.inputElement.value = file.name;

        const linkBase = path.join(liandi.current.dir.url, getPath(liandi.current.path));
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
