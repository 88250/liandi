import {rename} from '../util/rename';
import Vditor from '../../vditore/src';
import {Constants} from '../constants';
import * as path from 'path';
import {ipcRenderer} from 'electron';
import {BlockHint} from "./BlockHint";
import {hasTopClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getEditorRange} from "../../vditore/src/ts/util/selection";

export class Editors {
    private editors: IEditor[] = [];
    private editorsElement: HTMLElement;
    private blockHint: BlockHint;
    public currentEditor: IEditor;

    constructor() {
        this.editorsElement = document.getElementById('editors');
        window.onresize = () => {
            if (this.currentEditor?.vditor) {
                this.currentEditor.editorElement.style.height = (window.innerHeight - this.currentEditor.inputElement.clientHeight) + 'px';
            }
        };
        this.blockHint = new BlockHint()
    }

    private initVditor(liandi: ILiandi, editor: IEditor, html?: string) {
        if (typeof html === 'undefined' && editor.vditor) {
            html = editor.vditor.vditor.ir.element.innerHTML;
        }
        if (editor.vditor) {
            editor.vditor.destroy();
        }
        editor.vditor = new Vditor(editor.editorElement, {
            _lutePath: `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}`,
            debugger: true,
            icon: 'material',
            outline: liandi.config.markdown.outline,
            toolbarConfig: {
                hide: liandi.config.markdown.hideToolbar,
            },
            typewriterMode: true,
            height: window.innerHeight - editor.inputElement.clientHeight,
            hint: {
                emojiPath: path.posix.join(Constants.APP_DIR, 'vditore/dist/images/emoji'),
                extend: [
                    {
                        key: '((',
                        hint: (key) => {
                            liandi.ws.send('searchblock', {
                                k: key,
                                url: liandi.current.dir.url,
                                path: liandi.current.path
                            });
                            return [];
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
                'fullscreen',
                {
                    name: 'more',
                    toolbar: [
                        'code-theme',
                        'content-theme',
                        'export',
                        'outline',
                        'preview',
                        'devtools',
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
            cdn: path.posix.join(Constants.APP_DIR, 'vditore'),
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
                    path: path.posix.join(Constants.APP_DIR, 'vditore/dist/css/content-theme'),
                },
            },
            upload: {
                setHeaders: () => {
                    return {
                        'X-URL': encodeURIComponent(liandi.current.dir.url),
                        'X-PATH': encodeURIComponent(liandi.current.path),
                        'X-Mode': editor.vditor.getCurrentMode()
                    };
                },
                max: 128 * 1024 * 1024,
                linkToImgUrl: Constants.UPLOAD_FETCH_ADDRESS,
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').replace('/\\s/g', ''),
                url: Constants.UPLOAD_ADDRESS,
            },
            after: () => {
                editor.vditor.vditor.lute.SetLinkBase(path.posix.join(liandi.current.dir.url, liandi.current.path));
                editor.vditor.setHTML(html);
                editor.vditor.focus();
                this.blockHint.initEvent(liandi, editor.vditor.vditor.ir.element)
            },
            input: () => {
                editor.saved = false;
                // TODO auto save
            }
        });
    }

    private newEditor(liandi: ILiandi, html: string) {
        const inputElement = document.createElement('input');
        inputElement.className = 'editor__input';
        inputElement.addEventListener('blur', () => {
            rename(liandi, inputElement.value, liandi.current.dir.url, liandi.current.path);
        });

        const editorElement = document.createElement('div');
        editorElement.className = 'editor__vditor fn__flex-1';

        const divElement = document.createElement('div');
        divElement.append(inputElement);
        divElement.append(editorElement);
        this.editorsElement.insertAdjacentElement('beforeend', divElement);

        const editor: IEditor = {
            inputElement,
            editorElement,
            saved: true,
            active: true
        };
        this.initVditor(liandi, editor, html);
        this.currentEditor = editor;
        this.editors.push(editor);
    }

    public save(liandi: ILiandi) {
        if (!liandi.current.dir || !this.currentEditor || (this.currentEditor && this.currentEditor.saved)) {
            return;
        }
        liandi.ws.send('put', {
            url: liandi.current.dir.url,
            path: liandi.current.path,
            content: this.currentEditor.vditor.vditor.ir.element.innerHTML
        });
        this.currentEditor.saved = true;
    }

    public close(liandi: ILiandi) {
        if (!this.currentEditor) {
            return;
        }
        this.save(liandi);
        if (this.currentEditor.vditor) {
            this.currentEditor.vditor.destroy();
        }
        this.currentEditor.inputElement.parentElement.classList.add('fn__none');
    }

    public focus() {
        this.currentEditor?.vditor?.focus();
    }

    public reloadEditor(liandi: ILiandi) {
        if (this.currentEditor) {
            this.initVditor(liandi, this.currentEditor);
        }
    }

    public onSetTheme(liandi: ILiandi, theme: TTheme) {
        liandi.config.theme = theme;
        ipcRenderer.send(Constants.LIANDI_CONFIG_THEME, theme);
        if (theme === 'dark') {
            document.body.classList.add('theme--dark');
        } else {
            document.body.classList.remove('theme--dark');
        }
        this.editors.forEach((item) => {
            if (item.vditor) {
                item.vditor.setTheme(liandi.config.theme === 'dark' ? 'dark' : 'classic', liandi.config.theme)
            }
        })
    }

    public onGet(liandi: ILiandi, editorData: { content: string, name: string }) {
        if (this.currentEditor) {
            this.initVditor(liandi, this.currentEditor, editorData.content);
        } else {
            this.newEditor(liandi, editorData.content);
        }
        this.currentEditor.inputElement.value = editorData.name;
        document.querySelector<HTMLElement>('.editor__empty').style.display = "none"
    }

    public showSearchBlock(liandi: ILiandi, data: { k: string, blocks: IBlock[], url: string, path: string }) {
        if (liandi.current.dir.url !== data.url || liandi.current.dir.path !== data.path) {
            return
        }
        const currentBlockElement = hasTopClosestByAttribute(getEditorRange(this.currentEditor.vditor.vditor.ir.element).startContainer, "data-block", '0')
        let nodeId = ''
        if (currentBlockElement) {
            nodeId = currentBlockElement.getAttribute("data-node-id")
        }
        const dataList: IHintData[] = [];
        data.blocks.forEach(item => {
            if (nodeId !== item.id) {
                dataList.push({
                    value: `((${item.id} ""))`,
                    html: `<span class="fn__flex"><span style="max-width: 520px;min-width: 120px" class="fn__ellipsis fn__flex-shrink0 fn__a">${item.content}</span><span class="fn__flex-1 fn__flex-shrink0" style="min-width: 10px"></span>
<span class="ft__smaller ft__secondary">${item.path.substr(1)}</span></span>`,
                });
            }
        });
        this.currentEditor.vditor.vditor.hint.genHTML(dataList, data.k, this.currentEditor.vditor.vditor);
    }

    public onGetBlock(data: { id: string, block: IBlock }) {
        this.blockHint.getBlock(data);
    }
}
