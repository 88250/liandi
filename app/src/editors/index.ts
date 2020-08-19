import {rename} from "../util/rename";
import Vditor from "../../vditore/src";
import {Constants} from "../constants";
import * as path from "path";
import * as process from "process";
import {hasTopClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getEditorRange} from "../../vditore/src/ts/util/selection";
import {escapeHtml} from "../util/escape";
import {i18n} from "../i18n";

export class Editor {
    private element: HTMLElement;
    private saved = false
    private vditore: Vditor
    private url: string
    private path: string

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public initVditor(html?: string) {
        this.vditore = new Vditor(this.element, {
            // _lutePath: process.env.NODE_ENV === "development" ? `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}` : null,
            debugger: process.env.NODE_ENV === "development",
            icon: "material",
            lang: window.liandi.config.lang,
            outline: window.liandi.config.markdown.outline,
            toolbarConfig: {
                hide: window.liandi.config.markdown.hideToolbar,
            },
            typewriterMode: true,
            hint: {
                emojiPath: path.posix.join(Constants.APP_DIR, "vditore/dist/images/emoji"),
                extend: [
                    {
                        key: "((",
                        hint: (key) => {
                            window.liandi.ws.send("searchblock", {
                                k: key,
                                url: window.liandi.current.dir.url,
                                path: window.liandi.current.path
                            });
                            return [];
                        },
                    }],
            },
            toolbar: [
                "emoji",
                "headings",
                "bold",
                "italic",
                "strike",
                "link",
                "|",
                "list",
                "ordered-list",
                "check",
                "outdent",
                "indent",
                "|",
                "quote",
                "line",
                "code",
                "inline-code",
                "insert-before",
                "insert-after",
                "|",
                "upload",
                "table",
                "|",
                "undo",
                "redo",
                "|",
                "fullscreen",
                {
                    name: "more",
                    toolbar: [
                        "code-theme",
                        "content-theme",
                        "export",
                        "outline",
                        "preview",
                        "devtools",
                    ],
                }],
            tab: "\t",
            theme: window.liandi.config.theme === "dark" ? "dark" : "classic",
            cache: {
                enable: false
            },
            counter: {
                enable: true
            },
            cdn: path.posix.join(Constants.APP_DIR, "vditore"),
            preview: {
                markdown: {
                    autoSpace: window.liandi.config.markdown.autoSpace,
                    chinesePunct: window.liandi.config.markdown.chinesePunct,
                    fixTermTypo: window.liandi.config.markdown.fixTermTypo,
                    toc: window.liandi.config.markdown.toc,
                    footnotes: window.liandi.config.markdown.footnotes,
                    paragraphBeginningSpace: window.liandi.config.markdown.paragraphBeginningSpace
                },
                math: {
                    inlineDigit: window.liandi.config.markdown.inlineMathAllowDigitAfterOpenMarker,
                    engine: window.liandi.config.markdown.mathEngine,
                },
                hljs: {
                    style: window.liandi.config.theme === "dark" ? "native" : "github"
                },
                theme: {
                    current: window.liandi.config.theme,
                    path: path.posix.join(Constants.APP_DIR, "vditore/dist/css/content-theme"),
                },
            },
            upload: {
                setHeaders: () => {
                    return {
                        "X-URL": encodeURIComponent(window.liandi.current.dir.url),
                        "X-PATH": encodeURIComponent(window.liandi.current.path),
                        "X-Mode": this.vditore.getCurrentMode()
                    };
                },
                max: 128 * 1024 * 1024,
                linkToImgUrl: Constants.UPLOAD_FETCH_ADDRESS,
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, "").replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, "").replace("/\\s/g", ""),
                url: Constants.UPLOAD_ADDRESS,
            },
            after: () => {
                const lnkBase = path.posix.join(window.liandi.current.dir.url, path.posix.dirname(window.liandi.current.path));
                this.vditore.vditor.lute.SetLinkBase(lnkBase.endsWith("/") ? lnkBase : lnkBase + "/");
                this.vditore.setHTML(html);
                this.vditore.focus();
                // this.blockHint.initEvent(window.liandi, this.vditore.vditor.ir.element);
            },
            input: () => {
                this.saved = false;
                // this.currentEditor.inputElement.classList.add("editor__input--unsave");
                // TODO auto save
            }
        });
    }

    public resize() {
        // if (this.currentEditor?.vditor) {
        //     this.currentEditor.editorElement.style.height = (window.innerHeight - this.currentEditor.inputElement.clientHeight) + "px";
        // }
    }

    private newEditor(liandi: ILiandi, html: string) {
        const inputElement = document.createElement("input");
        inputElement.className = "editor__input";
        inputElement.addEventListener("blur", () => {
            rename(liandi, inputElement.value, liandi.current.dir.url, liandi.current.path);
        });

        const editorElement = document.createElement("div");
        editorElement.className = "editor__vditor fn__flex-1";

        const divElement = document.createElement("div");
        divElement.append(inputElement);
        divElement.append(editorElement);
        this.element.insertAdjacentElement("beforeend", divElement);

        // const editor = {
        //     inputElement,
        //     editorElement,
        //     saved: true,
        //     active: true
        // };
        this.initVditor(html);
        // this.currentEditor = editor;
        // this.editors.push(editor);
    }

    public save() {
        // if (!liandi.current.dir || !this.currentEditor || (this.currentEditor && this.currentEditor.saved)) {
        //     return;
        // }
        // liandi.ws.send("put", {
        //     url: liandi.current.dir.url,
        //     path: liandi.current.path,
        //     content: processRemoveDataRender1(this.currentEditor.vditor.vditor.ir.element, "innerHTML")
        // });
        // this.currentEditor.saved = true;
        // this.currentEditor.inputElement.classList.remove("editor__input--unsave");
    }

    public open(liandi: ILiandi, url: string, path: string) {
        // liandi.editors.save(liandi);
        liandi.current = {
            dir: {url},
            path
        };
        liandi.ws.send("get", {
            url,
            path
        });
    }

    public close() {
        // if (!this.currentEditor) {
        //     return;
        // }
        // this.save(liandi);
        // if (this.currentEditor.vditor) {
        //     this.currentEditor.vditor.destroy();
        // }
        // this.currentEditor.inputElement.parentElement.classList.add("fn__none");
        // document.querySelector<HTMLElement>(".editor__empty").style.display = "flex";
    }

    public focus() {
        // this.currentEditor?.vditor?.focus();
    }

    public reloadEditor() {
        // if (this.currentEditor) {
        //     this.initVditor();
        // }
    }

    public onGet() {
        // if (this.currentEditor) {
        //     this.initVditor(editorData.content);
        //     this.editorsElement.lastElementChild.classList.remove("fn__none");
        // } else {
        //     this.newEditor(liandi, editorData.content);
        // }
        // this.currentEditor.inputElement.value = editorData.name;
        // document.querySelector<HTMLElement>(".editor__empty").style.display = "none";
    }

    public showSearchBlock(data: { k: string, blocks: IBlock[], url: string, path: string }) {
        if (window.liandi.current.dir.url !== data.url || window.liandi.current.path !== data.path) {
            return;
        }
        const currentBlockElement = hasTopClosestByAttribute(getEditorRange(this.vditore.vditor.ir.element).startContainer, "data-block", "0");
        let nodeId = "";
        if (currentBlockElement) {
            nodeId = currentBlockElement.getAttribute("data-node-id");
        }
        const dataList: IHintData[] = [];
        data.blocks.forEach((item, index) => {
            if (index > 6) {
                return;
            }
            let iconName = "";
            switch (item.type) {
                case "NodeDocument":
                    iconName = "iconMD";
                    break;
                case "NodeParagraph":
                    iconName = "iconParagraph";
                    break;
                case "NodeHeading":
                    iconName = "vditor-icon-headings";
                    break;
                case "NodeBlockquote":
                    iconName = "vditor-icon-quote";
                    break;
                case "NodeList":
                    iconName = "vditor-icon-list";
                    break;
                case "NodeCodeBlock":
                    iconName = "vditor-icon-code";
                    break;
                case "NodeTable":
                    iconName = "vditor-icon-table";
                    break;
            }
            if (nodeId !== item.id) {
                const title = escapeHtml(item.path.substr(1));
                dataList.push({
                    value: `((${item.id} "${iconName === "iconMD" ? title : ""}"))`,
                    html: `<span class="fn__flex"><svg color="fn__flex-shrink0"><use xlink:href="#${iconName}"></use></svg><span style="max-width: 520px;min-width: 120px" class="fn__ellipsis fn__flex-shrink0">${escapeHtml(item.content).replace("&lt;mark", "<mark").replace("&lt;/mark", "</mark")}</span><span class="fn__flex-1 fn__flex-shrink0" style="min-width: 10px"></span>
<span class="ft__smaller ft__secondary">${title}</span></span>`,
                });
            }
        });
        dataList.push({
            value: "((newFile))",
            html: `<span class="fn__flex"><svg color="fn__flex-shrink0"><use xlink:href="#iconMD"></use></svg><span style="max-width: 520px;min-width: 120px" class="fn__ellipsis fn__flex-shrink0">${i18n[window.liandi.config.lang].newFile}</span></span>`,
        });
        // this.currentEditor.vditor.vditor.hint.genHTML(dataList, data.k, this.currentEditor.vditor.vditor);
    }

    public onGetBlock() {
        // this.blockHint.getBlock(liandi, data);
    }
}
