import * as path from "path";
import {i18n} from "../i18n";
import {escapeHtml} from "../util/escape";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {openFile} from "../editor/util";

export class Backlinks extends Model {
    private element: HTMLElement
    public url: string
    public path: string

    constructor(options: {
        tab: Tab
        url?: string
        path?: string
    }) {
        super({
            id: options.tab.id,
            callback() {
                if (options.path) {
                    this.send("treebacklinks", {
                        url: options.url,
                        path: options.path
                    });
                } else {
                    this.send("backlinks", {});
                    this.element.innerHTML = `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
                }
            }
        });
        this.url = options.url;
        this.path = options.path;
        this.ws.onmessage = (event) => {
            const data = processMessage(event.data);
            if (data) {
                switch (data.cmd) {
                    case "backlinks":
                    case "treebacklinks":
                        this.onBacklinks(data.data);
                        break;
                    case "reload":
                        if (this.path) {
                            if (data.data.url === this.url && data.data.path === this.path) {
                                this.send("treebacklinks", {
                                    url: options.url,
                                    path: options.path
                                });
                            }
                        } else {
                            this.send("backlinks", {});
                        }
                        break;
                }
            }
        };

        this.element = options.tab.panelElement;
        this.element.classList.add("backlinks");
        this.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.isEqualNode(this.element)) {
                if (target.tagName === "H2") {
                    openFile(decodeURIComponent(target.getAttribute("data-url")), decodeURIComponent(target.getAttribute("data-path")));
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                }
                target = target.parentElement;
            }
        });
    }

    public onBacklinks(data: { backlinks: IBacklinks[] | IAllBacklinks[], url: string, path: string }) {
        let backlinksHTML = "";
        if (data.url) {
            backlinksHTML = '';
            (data.backlinks as IBacklinks[]).forEach((files) => {
                backlinksHTML += '<div class="item">';
                files.blocks.forEach((item, index) => {
                    if (index === 0) {
                        backlinksHTML += `<h2 data-path="${encodeURIComponent(item.path)}" data-url="${encodeURIComponent(item.url)}" class="fn__flex"">
<span class="fn__flex-1">${escapeHtml(path.posix.basename(files.path))}</span>
<span class="ft__smaller fn__flex-center">${escapeHtml(path.posix.dirname(item.path).substr(1))}</span>
</h2>`;
                    }
                    backlinksHTML += `<div class="item__content fn__two-line">${escapeHtml(item.content)}</div>`;
                });
                backlinksHTML += "</div>";
            });
        } else {
            (data.backlinks as IAllBacklinks[]).forEach((item) => {
                backlinksHTML += `<div class="item"><h2 data-path="${encodeURIComponent(item.def.path)}" data-url="${encodeURIComponent(item.def.url)}" class="fn__flex"">
<span class="fn__flex-1">${escapeHtml(item.def.content)}</span>
<span class="ft__smaller fn__flex-center">${escapeHtml(path.posix.basename(item.def.path))}</span>
</h2>`
                item.refs.forEach((ref) => {
                    backlinksHTML += `<div class="item__content fn__two-line">${escapeHtml(ref.content)}</div>`;
                })
                backlinksHTML += "</div>";
            });
        }

        if (data.backlinks.length === 0) {
            backlinksHTML += `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
        }

        this.element.innerHTML = backlinksHTML;
    }
}
