import * as path from "path";
import {i18n} from "../i18n";
import {escapeHtml} from "../util/escape";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";

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
                if (path) {
                    this.send("backlinks", {
                        url: options.url,
                        path: options.path
                    });
                } else {
                    this.element.innerHTML = `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
                }
            }
        });
        this.url = options.url;
        this.path = options.path;
        this.ws.onmessage = (event) => {
            const data = processMessage(event.data, this.reqId);
            if (data) {
                switch (data.cmd) {
                    case "backlinks":
                        this.onBacklinks(data.data);
                        break;
                }
            }
        };

        this.element = options.tab.panelElement;
        this.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && !target.isEqualNode(this.element)) {
                if (target.tagName === "H2") {
                    // window.liandi.editors.open(window.liandi, decodeURIComponent(target.getAttribute("data-url")), decodeURIComponent(target.getAttribute("data-path")));
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                }
                target = target.parentElement;
            }
        });
    }

    public onBacklinks(data: { backlinks: IBacklinks[], url: string, path: string }) {
        let backlinksHTML = `<div class="backlinks__title">
<div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].backlinks}</div>
<div class="fn__ellipsis">${escapeHtml(path.posix.join(path.posix.basename(data.url), data.path))}</div>
</div>`;
        data.backlinks.forEach((files) => {
            backlinksHTML += '<div class="item">';
            files.blocks.forEach((item, index) => {
                if (index === 0) {
                    backlinksHTML += `<h2 data-type="backlinks-file" data-path="${encodeURIComponent(item.path)}" data-url="${encodeURIComponent(item.url)}" class="fn__flex"">
<span class="fn__flex-1">${escapeHtml(path.posix.basename(files.path))}</span>
<span class="ft__smaller fn__flex-center">${escapeHtml(path.posix.dirname(item.path).substr(1))}</span>
</h2>`;
                }
                backlinksHTML += `<div class="item__content fn__two-line">${escapeHtml(item.content)}</div>`;
            });
            backlinksHTML += "</div>";
        });
        if (data.backlinks.length === 0) {
            backlinksHTML += `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
        }
        this.element.innerHTML = backlinksHTML;
    }
}
