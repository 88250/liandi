import {i18n} from '../i18n';
import {Constants} from '../constants';
import {rename} from '../util/rename';
import {getPath} from '../util/path';
import * as path from 'path';

const Vditor = require('vditor');

export class Editors {
    public inputWrapElement: HTMLElement;
    public element: HTMLElement;
    private editorElement: HTMLElement;
    private vditor: any;
    private timeoutId: number;
    public saved: boolean;

    constructor(liandi: ILiandi) {
        this.saved = true;
        this.element = document.getElementById('editors');
        this.inputWrapElement = document.createElement('div');
        this.inputWrapElement.className = 'fn__flex';
        this.inputWrapElement.innerHTML = `<input class="editors__input fn__flex-1"><button class="button">${i18n[Constants.LANG].save}</button>`;
        this.inputWrapElement.querySelector('button').addEventListener('click', () => {
            this.saveContent(liandi);
        });

        this.inputWrapElement.querySelector('input').addEventListener('blur', () => {
            rename(this.inputWrapElement.querySelector('input').value, liandi.current.dir.url, liandi.current.path);
        });

        this.editorElement = document.createElement('div');
        this.editorElement.id = 'liandiVditor';
        this.editorElement.className = 'fn__flex-1';
    }

    remove(liandi: ILiandi) {
        clearTimeout(this.timeoutId);
        this.saveContent(liandi);
        this.element.innerHTML = '';
    }

    public saveContent(liandi: ILiandi) {
        if (this.saved) {
            return;
        }
        if (this.element.innerHTML === '') {
            return;
        }
        liandi.ws.send('put', {
            url: liandi.current.dir.url,
            path: liandi.current.path,
            content: this.vditor.getValue()
        });
    }

    onGet(liandi: ILiandi, file: { content: string, name: string }) {
        if (this.element.innerHTML === '') {
            this.element.appendChild(this.inputWrapElement);
            this.element.appendChild(this.editorElement);
        }

        this.inputWrapElement.querySelector('input').value = file.name;

        const linkBase = path.join(liandi.current.dir.url, getPath(liandi.current.path));
        if (this.editorElement.innerHTML !== '') {
            this.vditor.vditor.lute.SetLinkBase(linkBase);
            this.vditor.vditor.options.upload.headers = {
                'X-URL': encodeURIComponent(liandi.current.dir.url),
                'X-PATH': encodeURIComponent(liandi.current.path)
            };
            this.vditor.setValue(file.content);
        } else {
            this.vditor = new Vditor('liandiVditor', {
                cache: false,
                cdn: '../node_modules/vditor',
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
                    this.vditor.setValue(file.content);
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
}
