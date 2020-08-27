import Vditor from "../../vditore/src";
import {Constants} from "../constants";
import * as path from "path";
import * as process from "process";
import {hasClosestByAttribute, hasTopClosestByAttribute} from "../../vditore/src/ts/util/hasClosest";
import {getEditorRange, setSelectionFocus} from "../../vditore/src/ts/util/selection";
import {escapeHtml} from "../util/escape";
import {i18n} from "../i18n";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {getIconByType, openFile} from "./util";
import {scrollCenter} from "../../vditore/src/ts/util/editorCommonEvent";
import {processRemoveDataRender1} from "../../vditore/src/ts/ir/process";
import {destroyDialog} from "../util/dialog";
import {expandMarker} from "../../vditore/src/ts/ir/expandMarker";
import {getAllModels} from "../layout/util";
import {mathRender} from "../../vditore/src/ts/markdown/mathRender";
import {mermaidRender} from "../../vditore/src/ts/markdown/mermaidRender";
import {graphvizRender} from "../../vditore/src/ts/markdown/graphvizRender";
import {chartRender} from "../../vditore/src/ts/markdown/chartRender";
import {mindmapRender} from "../../vditore/src/ts/markdown/mindmapRender";
import {abcRender} from "../../vditore/src/ts/markdown/abcRender";
import {mediaRender} from "../../vditore/src/ts/markdown/mediaRender";

export class Editor extends Model {
    public element: HTMLElement;
    private blockVditorElement: HTMLElement;
    private blockTipElement: HTMLElement;
    public saved = true
    public vditore: Vditor
    public url: string
    public path: string
    public range: Range
    private nodeId?: string

    constructor(options: {
        tab: Tab,
        url: string,
        path: string,
        nodeId?: string,
    }) {
        super({
            id: options.tab.id,
            callback() {
                this.send("get", {
                    url: options.url,
                    path: options.path,
                    id: options.nodeId || ""
                }, true);

            }
        });

        this.ws.onmessage = (event) => {
            const data = processMessage(event.data);
            if (data) {
                switch (data.cmd) {
                    case "get":
                        this.parent.headElement.setAttribute("data-node-id", data.data.rootID);
                        if (data.callback === Constants.CB_PUT_RELOAD) {
                            this.reloadHTML(data.data.content);
                            this.saved = true;
                            this.parent.headElement.classList.remove("item--unsave");
                        } else {
                            this.initVditor(data.data.content);
                        }
                        break;
                    case "searchblock":
                        this.showSearchBlock(data.data);
                        break;
                    case "getblock":
                        this.onGetBlock(data.data);
                        break;
                    case "reload":
                        if (data.data.url === this.url && data.data.path === this.path) {
                            this.send("get", {
                                url: this.url,
                                path: this.path,
                                id: "",
                                callback: Constants.CB_PUT_RELOAD
                            });
                        }
                        break;
                    case "create":
                        if (data.data.callback === Constants.CB_CREATE_INSERT) {
                            setSelectionFocus(this.range);
                            this.vditore.insertValue(`((${data.data.id} "${data.data.name}"))`);
                            if (getAllModels().files.length === 0) {
                                destroyDialog();
                            }
                        }
                        break;
                    case "rename":
                        if (data.data.url === this.url && data.data.oldPath === this.path && !data.data.newPath.endsWith("/")) {
                            this.path = data.data.newPath;
                            this.parent.headElement.querySelector("span").textContent = data.data.newName;
                            destroyDialog();
                        }
                        break;
                }
            }
        };

        this.element = options.tab.panelElement;
        this.url = options.url;
        this.path = options.path;
        this.nodeId = options.nodeId;

        this.blockTipElement = document.createElement("div");
        this.blockTipElement.classList.add("editor__blockhint", "vditor-reset");

        let timeoutId: number;
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
                    id: blockVditorElement.querySelector(".vditor-ir__marker--link").textContent,
                    url: this.url
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
        if (typeof html === "undefined") {
            html = processRemoveDataRender1(this.vditore.vditor.ir.element, "innerHTML");
            this.vditore.destroy();
        }
        let inputTimeout: number;
        this.vditore = new Vditor(this.element, {
            _lutePath: process.env.NODE_ENV === "development" ? `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}` : null,
            debugger: process.env.NODE_ENV === "development",
            icon: "material",
            height: this.element.parentElement.clientHeight,
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
                "headings",
                "bold",
                "italic",
                "link",
                "|",
                "list",
                "ordered-list",
                "check",
                "outdent",
                "indent",
                "|",
                "quote",
                "code",
                "insert-before",
                "insert-after",
                "|",
                "upload",
                "table",
                "|",
                "undo",
                "redo",
                "|",
                "preview",
                "export",
                "fullscreen",
                {
                    name: "more",
                    toolbar: [
                        "emoji",
                        "strike",
                        "line",
                        "inline-code",
                        "code-theme",
                        "content-theme",
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
                    paragraphBeginningSpace: window.liandi.config.markdown.paragraphBeginningSpace,
                    mark: window.liandi.config.markdown.mark
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
                        "X-URL": encodeURIComponent(this.url),
                        "X-PATH": encodeURIComponent(this.path),
                        "X-Mode": this.vditore.getCurrentMode()
                    };
                },
                max: 128 * 1024 * 1024,
                linkToImgUrl: Constants.UPLOAD_FETCH_ADDRESS,
                filename: (name: string) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, "").replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, "").replace("/\\s/g", ""),
                url: Constants.UPLOAD_ADDRESS,
            },
            after: (vditore) => {
                vditore.vditor.model = this;
                const lnkBase = path.posix.join(this.url, path.posix.dirname(this.path));
                vditore.vditor.lute.SetLinkBase(lnkBase.endsWith("/") ? lnkBase : lnkBase + "/");
                vditore.setHTML(html);
                if (this.nodeId) {
                    const nodeElement = vditore.vditor.ir.element.querySelector(`[data-node-id="${this.nodeId}"]`) as HTMLElement;
                    if (nodeElement) {
                        const range = getEditorRange(vditore.vditor.ir.element);
                        range.selectNodeContents(nodeElement.firstChild);
                        range.collapse(true);
                        expandMarker(range, vditore.vditor);
                        setSelectionFocus(range);
                        vditore.vditor.ir.element.scrollTop = nodeElement.offsetTop - vditore.vditor.ir.element.clientHeight / 2;
                    }
                } else {
                    vditore.focus();
                }
                this.element.insertAdjacentElement("beforeend", this.blockTipElement);
            },
            save: (content: string) => {
                if (this.saved) {
                    return;
                }
                this.send("put", {
                    url: this.url,
                    path: this.path,
                    content,
                    reloadPushMode: 2
                });
                this.saved = true;
                this.parent.headElement.classList.remove("item--unsave");
            },
            input: (content: string) => {
                this.saved = false;
                this.parent.headElement.classList.add("item--unsave");
                if (process.env.NODE_ENV === "development") {
                    return;
                }
                clearTimeout(inputTimeout);
                inputTimeout = window.setTimeout(() => {
                    if (this.saved) {
                        return;
                    }
                    this.send("put", {
                        url: this.url,
                        path: this.path,
                        content,
                        reloadPushMode: 2
                    });
                    this.saved = true;
                    this.parent.headElement.classList.remove("item--unsave");
                }, 2000);
            }
        });
    }

    public reloadVditor() {
        this.initVditor();
    }

    public reloadHTML(html: string) {
        this.vditore.setHTML(html);
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
            const iconName = getIconByType(item.type);
            if (nodeId !== item.id) {
                const title = escapeHtml(item.path.substr(1));
                dataList.push({
                    value: `((${item.id} "${iconName === "iconMD" ? title : ""}"))`,
                    html: `<span class="fn__flex">
<svg class="fn__flex-shrink0"><use xlink:href="#${iconName}"></use></svg>
<span class="fn__flex-1 fn__ellipsis fn__flex-shrink0">${escapeHtml(item.content).replace("&lt;mark", "<mark").replace("&lt;/mark", "</mark")}</span>
<span class="fn__space fn__flex-shrink0"></span>
<span class="ft__smaller ft__secondary fn__flex-shrink0">${title}</span>
</span>`,
                });
            }
        });
        dataList.push({
            value: "((newFile))",
            html: `<span class="fn__flex">
<svg><use xlink:href="#iconMD"></use></svg>
<span>${i18n[window.liandi.config.lang].newFile}</span>
</span>`,
        });
        this.vditore.vditor.hint.genHTML(dataList, data.k, this.vditore.vditor);
    }

    public onGetBlock(data: { id: string, block: IBlock, callback: string }) {
        if (!data.block) {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_OPEN) {
            openFile(data.block.url, data.block.path);
            return;
        }
        if (data.block.content.trim() === "") {
            return;
        }
        if (data.callback === Constants.CB_GETBLOCK_EMBED) {
            const blockVditorElement = this.vditore.vditor.ir.element.querySelector(`[data-block-def-id="${data.id}"]`) as HTMLElement;
            blockVditorElement.setAttribute("data-render", "1");
            blockVditorElement.innerHTML = data.block.content;
            mathRender(blockVditorElement, {
                cdn: this.vditore.vditor.options.cdn,
                math: this.vditore.vditor.options.preview.math,
            });
            mermaidRender(blockVditorElement, ".language-mermaid", this.vditore.vditor.options.cdn);
            graphvizRender(blockVditorElement, this.vditore.vditor.options.cdn);
            chartRender(blockVditorElement, this.vditore.vditor.options.cdn);
            mindmapRender(blockVditorElement, this.vditore.vditor.options.cdn);
            abcRender(blockVditorElement, this.vditore.vditor.options.cdn);
            mediaRender(blockVditorElement);
            scrollCenter(this.vditore.vditor);
            return;
        }

        const parentRect = this.vditore.vditor.element.getBoundingClientRect();
        const elementRect = this.blockVditorElement.getBoundingClientRect();
        this.blockTipElement.innerHTML = data.block.content;
        mathRender(this.blockTipElement, {
            cdn: this.vditore.vditor.options.cdn,
            math: this.vditore.vditor.options.preview.math,
        });
        mermaidRender(this.blockTipElement, ".language-mermaid", this.vditore.vditor.options.cdn);
        graphvizRender(this.blockTipElement, this.vditore.vditor.options.cdn);
        chartRender(this.blockTipElement, this.vditore.vditor.options.cdn);
        mindmapRender(this.blockTipElement, this.vditore.vditor.options.cdn);
        abcRender(this.blockTipElement, this.vditore.vditor.options.cdn);
        mediaRender(this.blockTipElement);
        const top = elementRect.top - parentRect.top + elementRect.height + 5;
        const left = elementRect.left - parentRect.left;
        this.blockTipElement.setAttribute("style", `display:block;top:${top}px;left:${left}px`);
        // 展现在上部
        if (this.blockTipElement.getBoundingClientRect().bottom > window.innerHeight) {
            this.blockTipElement.style.top = `${top - this.blockTipElement.clientHeight - elementRect.height - 15}px`;
        }
        if (this.blockTipElement.getBoundingClientRect().right > parentRect.right) {
            this.blockTipElement.style.left = "auto";
            this.blockTipElement.style.right = "0";
        }
    }
}
