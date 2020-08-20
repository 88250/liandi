import {rename} from "../util/rename";
import Vditor from "../../vditore/src";
import {Constants} from "../constants";
import * as path from "path";
import * as process from "process";
import {hasClosestByAttribute, hasTopClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getEditorRange} from "../../vditore/src/ts/util/selection";
import {escapeHtml} from "../util/escape";
import {i18n} from "../i18n";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {openFile} from "./util";
import {scrollCenter} from "../../vditore/src/ts/util/editorCommonEvent";

export class Editor extends Model {
    private element: HTMLElement;
    public blockVditorElement: HTMLElement;
    private blockTipElement: HTMLElement;
    private saved = false
    private vditore: Vditor
    public url: string
    public path: string
    public range: Range

    constructor(options: {
        tab: Tab,
        url: string,
        path: string
    }) {
        super({
            id: options.tab.id,
            callback() {
                this.send("get", {
                    url: options.url,
                    path: options.path
                });

            }
        });

        this.ws.onmessage = (event) => {
            const data = processMessage(event.data, this.reqId);
            if (data) {
                switch (data.cmd) {
                    case "get":
                        this.initVditor(data.data.content);
                        break;
                    case "searchblock":
                        this.showSearchBlock(data.data);
                        break;
                    case "getblock":
                        this.onGetBlock(data.data);
                        break;
                }
            }
        };

        this.element = options.tab.panelElement;
        this.url = options.url;
        this.path = options.path;

        this.blockTipElement = document.createElement('div')
        this.blockTipElement.classList.add("editor__blockhint")

        let timeoutId:number
        this.blockTipElement.addEventListener("mouseenter", () => {
            clearTimeout(timeoutId);
        });
        this.blockTipElement.addEventListener("mouseleave", () => {
            timeoutId = window.setTimeout(() => {
                this.blockTipElement.style.display = "none";
            }, 300);
        });
        this.element.addEventListener("mouseover", (event: MouseEvent & { target: HTMLElement }) => {
            const blockVditorElement = hasClosestByAttribute(event.target, "data-type", "block-ref");
            if (blockVditorElement) {

                this.blockVditorElement = blockVditorElement;
                this.send("getblock", {
                    id: blockVditorElement.querySelector(".vditor-ir__marker--link").textContent
                });

                clearTimeout(timeoutId);
                blockVditorElement.onmouseleave = () => {
                    timeoutId = window.setTimeout(() => {
                        this.blockTipElement.style.display = "none";
                    }, 300);
                };
            }
        });
    }

    public initVditor(html?: string) {
        this.vditore = new Vditor(this.element, {
            _lutePath: process.env.NODE_ENV === "development" ? `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}` : null,
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
                            this.send("searchblock", {
                                k: key,
                                url: this.url,
                                path: this.path
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
                const lnkBase = path.posix.join(this.url, path.posix.dirname(this.path));
                this.vditore.vditor.lute.SetLinkBase(lnkBase.endsWith("/") ? lnkBase : lnkBase + "/");
                this.vditore.setHTML(html);
                this.vditore.focus();
                this.element.insertAdjacentElement("beforeend", this.blockTipElement)
            },
            save: (content: string) => {
                if (this.saved) {
                    return;
                }
                this.send("put", {
                    url: this.url,
                    path: this.path,
                    content,
                });
                this.saved = true;
                this.parent.headElement.classList.remove("item--unsave");
            },
            input: () => {
                this.saved = false;
                this.parent.headElement.classList.add("item--unsave");
                // TODO auto save
            }
        });
        this.vditore.vditor.model = this
    }

    public resize() {
        // if (this.currentEditor?.vditor) {
        //     this.currentEditor.editorElement.style.height = (window.innerHeight - this.currentEditor.inputElement.clientHeight) + "px";
        // }
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

    public showSearchBlock(data: { k: string, blocks: IBlock[], url: string, path: string }) {
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
        this.vditore.vditor.hint.genHTML(dataList, data.k, this.vditore.vditor);
    }

    public onGetBlock(data: { id: string, block: IBlock, callback: string }) {
        if (!data.block) {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_OPEN) {
            openFile(this.parent.parent, data.block.url, data.block.path)
            return;
        }
        if (data.block.content.trim() === "") {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_EMBED) {
            this.blockVditorElement.setAttribute("data-render", "1");
            this.blockVditorElement.innerHTML = data.block.content;
            scrollCenter(this.vditore.vditor);
            return;
        }

        const elementRect = this.blockVditorElement.getBoundingClientRect();
        this.blockTipElement.innerHTML = data.block.content;
        const top = elementRect.top + elementRect.height + 5;
        const left = elementRect.left;
        this.blockTipElement.setAttribute("style", `display:block;top:${top}px;left:${left}px`);
        // 展现在上部
        if (this.blockTipElement.getBoundingClientRect().bottom > window.innerHeight) {
            this.blockTipElement.style.top = `${top - this.blockTipElement.clientHeight - 10 - elementRect.height}px`;
        }
        if (this.blockTipElement.getBoundingClientRect().right > window.innerWidth) {
            this.blockTipElement.style.left = "auto";
            this.blockTipElement.style.right = "0";
        }
    }
}