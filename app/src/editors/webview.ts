import '../assets/scss/editor.scss';
import {Constants} from '../constants';
import {getPath, urlJoin} from '../util/path';
import {initGlobalKeyPress} from '../hotkey';
import {ipcRenderer, remote, clipboard} from 'electron';
import {i18n} from '../i18n';
import Vditor from '../../vditore/src';

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
        window.onresize = (event: Event) => {
            document.getElementById('liandiVditor').style.height = (window.innerHeight - 20) + 'px';
        };
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
                clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ''));
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
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
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
    }

    private hotkey(event: KeyboardEvent) {
        if (this.isCtrl(event) && event.key.toLowerCase() === 'v' && !event.altKey && event.shiftKey) {
            const range = getSelection().getRangeAt(0);
            range.extractContents();
            this.vditor.insertValue(clipboard.readText());
            event.preventDefault();
        }

        if (this.isCtrl(event) && event.key.toLowerCase() === 'c' && !event.altKey && event.shiftKey) {
            clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ''));
            event.preventDefault();
        }
    }

    private onOpen(liandi: ILiandi, value: string = remote.getGlobal('liandiEditor').editorText) {
        document.getElementById('liandiVditor').innerHTML = '';
        let timeoutId: number;
        this.vditor = new Vditor('liandiVditor', {
            _lutePath: `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}`,
            outline: liandi.config.markdown.outline,
            height: window.innerHeight - 20,
            toolbarConfig: {
                hide: liandi.config.markdown.hideToolbar,
            },
            typewriterMode: true,
            hint: {
                extend: [
                    {
                        key: '((',
                        hint: (key) => {
                            console.log(key)
                            if ('vditor'.indexOf(key.toLocaleLowerCase()) > -1) {
                                return [
                                    {
                                        value: '((Vditor',
                                        html: '<span style="color: #999;">#Vditor</span> ♏ 一款浏览器端的 Markdown 编辑器，支持所见即所得（富文本）、即时渲染（类似 Typora）和分屏预览模式。',
                                    }]
                            }
                            return []
                        },
                    }],
            },
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
                {
                    name: 'more',
                    toolbar: [
                        'both',
                        'code-theme',
                        'content-theme',
                        'export',
                        'outline',
                        'preview',
                        'devtools',
                        'info',
                        'help',
                    ],
                }],
            tab: '\t',
            theme: liandi.config.theme === 'dark' ? 'dark' : 'classic',
            cache: {
                enable: false
            },
            counter: {
                enable: true
            },
            cdn: remote.getGlobal('liandiEditor').appDir + '/vditor',
            preview: {
                markdown: {
                    autoSpace: liandi.config.markdown.autoSpace,
                    chinesePunct: liandi.config.markdown.chinesePunct,
                    fixTermTypo: liandi.config.markdown.fixTermTypo,
                    toc: liandi.config.markdown.toc,
                    footnotes: liandi.config.markdown.footnotes,
                    paragraphBeginningSpace: liandi.config.markdown.paragraphBeginningSpace
                },
                math: {
                    inlineDigit: liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker,
                    engine: liandi.config.markdown.mathEngine,
                },
                hljs: {
                    style: liandi.config.theme === 'dark' ? 'native' : 'github'
                },
                theme: {
                    current: liandi.config.theme,
                    path: remote.getGlobal('liandiEditor').appDir + '/vditor/dist/css/content-theme',
                },
            },
            upload: {
                setHeaders: () => {
                    return {
                        'X-URL': encodeURIComponent(liandi.current.dir.url),
                        'X-PATH': encodeURIComponent(liandi.current.path),
                        'X-Mode': this.vditor.getCurrentMode()
                    };
                },
                max: 128 * 1024 * 1024,
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

        this.vditor.vditor.wysiwyg.element.addEventListener('keydown', (event: KeyboardEvent) => {
            this.hotkey(event);
        });
        this.vditor.vditor.sv.element.addEventListener('keydown', (event: KeyboardEvent) => {
            this.hotkey(event);
        });
        this.vditor.vditor.ir.element.addEventListener('keydown', (event: KeyboardEvent) => {
            this.hotkey(event);
        });
    }
}

const editor = new EditorWebview();
