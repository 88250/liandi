import '../assets/scss/editor.scss';
import {Constants} from '../constants';
import {getPath, urlJoin} from '../util/path';
import {initGlobalKeyPress} from '../hotkey';
import {ipcRenderer, remote, clipboard} from 'electron';
import {i18n} from '../i18n';

const Vditor = require('vditor');

export class EditorWebview {
    private isInitMenu: boolean;
    private vditor: any;
    private range: Range;

    constructor() {
        this.isInitMenu = false;
        this.range = document.createRange();
        initGlobalKeyPress(this);
        this.onMessage();
        if (process.platform === 'win32') {
            document.body.classList.add('body--win32');
        }
    }

    private initMenu(lang: keyof II18n) {
        if (this.isInitMenu) {
            return;
        }

        const menu = new remote.Menu();
        menu.append(new remote.MenuItem({
            label: i18n[lang].cut,
            id: 'cut',
            role: 'cut'
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].copy,
            id: 'copy',
            role: 'copy',
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].copyAsPlainText,
            id: 'copyAsPlainText',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
                clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ""));
            }
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].paste,
            id: 'paste',
            role: 'paste',
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].pasteAsPlainText,
            id: 'pasteAsPlainText',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => {
                this.vditor.insertValue(clipboard.readText());
            }
        }));

        window.addEventListener('contextmenu', event => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'PRE') {
                    menu.getMenuItemById('cut').enabled = menu.getMenuItemById('copy').enabled = this.vditor.getSelection() !== '';
                    menu.getMenuItemById('pasteAsPlainText').enabled = clipboard.readText() !== '';
                    menu.popup();
                    event.preventDefault();
                    return false;
                }
                target = target.parentElement;
            }
        });

        this.isInitMenu = true;
    }

    private onMessage() {
        ipcRenderer.on(Constants.LIANDI_EDITOR_OPEN, (event, data) => {
            if (data.config.theme === 'dark') {
                document.body.classList.add('theme--dark');
            } else {
                document.body.classList.remove('theme--dark');
            }
            this.onOpen(data);
            this.initMenu(data.config.lang);
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_RELOAD, (event, data) => {
            this.onOpen(data);
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_CURSOR, (event, data) => {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.range);
        });
    }

    private isCtrl(event: KeyboardEvent) {
        if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
            // mac
            if (event.metaKey && !event.ctrlKey) {
                return true;
            }
            return false;
        } else {
            if (!event.metaKey && event.ctrlKey) {
                return true;
            }
            return false;
        }
    };

    private onOpen(liandi: ILiandi, value: string = remote.getGlobal('liandiEditor').editorText) {
        document.getElementById('liandiVditor').innerHTML = '';
        let timeoutId: number;
        this.vditor = new Vditor('liandiVditor', {
            mode: liandi.config.markdown.editorMode,
            toolbarConfig: {
                hide: liandi.config.markdown.hideToolbar,
            },
            typewriterMode: true,
            toolbar: [
                'emoji',
                'headings',
                'bold',
                'italic',
                'strike',
                'link',
                '|',
                'list',
                'ordered-list',
                'check',
                'outdent',
                'indent',
                '|',
                'quote',
                'line',
                'code',
                'inline-code',
                'insert-before',
                'insert-after',
                '|',
                'upload',
                'table',
                '|',
                'undo',
                'redo',
                '|',
                'edit-mode',
                'both',
                'preview',
                'format',
                '|',
                {
                    name: 'fullscreen',
                    click: (isFullscreen: boolean) => {
                        if (isFullscreen) {
                            ipcRenderer.sendToHost(Constants.LIANDI_EDITOR_FULLSCREEN);
                            this.vditor.focus();
                            if (process.platform === 'darwin') {
                                (document.querySelector('.vditor-toolbar') as HTMLElement).style.paddingLeft = '70px';
                            }
                        } else {
                            ipcRenderer.sendToHost(Constants.LIANDI_EDITOR_RESTORE);
                            this.vditor.focus();
                            if (process.platform === 'darwin') {
                                (document.querySelector('.vditor-toolbar') as HTMLElement).style.paddingLeft = '0';
                            }
                        }
                    },
                },
                'outline',
                'devtools',
                'info',
                'help',
            ],
            tab: '\t',
            theme: liandi.config.theme === 'dark' ? 'dark' : 'classic',
            cache: {
                enable: false
            },
            counter: {
              enable: true
            },
            cdn: remote.getGlobal('liandiEditor').appDir + "/node_modules/vditor",
            preview: {
                markdown: {
                    autoSpace: liandi.config.markdown.autoSpace,
                    chinesePunct: liandi.config.markdown.chinesePunct,
                    fixTermTypo: liandi.config.markdown.fixTermTypo,
                    theme: liandi.config.theme,
                    toc: liandi.config.markdown.toc,
                    footnotes: liandi.config.markdown.footnotes,
                    setext: liandi.config.markdown.setext
                },
                math: {
                    inlineDigit: liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker,
                    engine: liandi.config.markdown.mathEngine,
                },
                hljs: {
                    style: liandi.config.theme === 'dark' ? 'native' : 'github'
                }
            },
            height: window.innerHeight - 20,
            upload: {
                setHeaders: () => {
                    return {
                        'X-URL': encodeURIComponent(liandi.current.dir.url),
                        'X-PATH': encodeURIComponent(liandi.current.path),
                        'X-Mode': this.vditor.getCurrentMode()
                    }
                },
                linkToImgUrl: Constants.UPLOAD_FETCH_ADDRESS,
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').replace('/\\s/g', ''),
                url: Constants.UPLOAD_ADDRESS,
            },
            after: () => {
                this.vditor.vditor.lute.SetLinkBase(urlJoin(liandi.current.dir.url, getPath(liandi.current.path)));
                this.vditor.setValue(value);
                remote.getGlobal('liandiEditor').editorText = value;
                remote.getGlobal('liandiEditor').saved = true;
                this.vditor.focus();
            },
            input: (textContent: string) => {
                remote.getGlobal('liandiEditor').editorText = textContent;
                remote.getGlobal('liandiEditor').saved = false;
                clearTimeout(timeoutId);
                timeoutId = window.setTimeout(() => {
                    ipcRenderer.sendToHost(Constants.LIANDI_WEBSOCKET_PUT);
                }, 5000);
            }
        });

        this.vditor.vditor.wysiwyg.element.addEventListener("keydown", (event: KeyboardEvent) => {
            if (this.isCtrl(event) && event.key.toLowerCase() === 'v' && !event.altKey && event.shiftKey) {
                const range = getSelection().getRangeAt(0)
                range.extractContents();
                this.vditor.insertValue(clipboard.readText());
                event.preventDefault();
            }

            if (this.isCtrl(event) && event.key.toLowerCase() === 'c' && !event.altKey && event.shiftKey) {
                clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ""));
                event.preventDefault();
            }
        })
    }
}

const editor = new EditorWebview();
