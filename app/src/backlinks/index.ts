import * as path from "path";
import {i18n} from "../i18n";
import {escapeHtml} from "../util/escape";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";

export class Backlinks extends Model {
    private element: HTMLElement

    constructor(tab: Tab) {
        super({
            id: tab.id,
            callback() {
                if (window.liandi.current) {
                    tab.model.ws.send("backlinks", {
                        url: window.liandi.current.dir.url,
                        path: window.liandi.current.path
                    });
                } else {
                    this.element.innerHTML = `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
                }
            }
        });

        this.ws.onmessage = (event) => {
            const data = processMessage(event.data, this.reqId);
            if (data) {
                switch (data.cmd) {
                    case "backlinks":
                        this.onBacklinks(data.data.backlinks);
                        break;
                }
            }
        };

        this.element = tab.panelElement;
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

    public onBacklinks(backlinks: IBacklinks[]) {
        let backlinksHTML = `<div class="backlinks__title">
<div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].backlinks}</div>
<div class="fn__ellipsis">${escapeHtml(path.posix.join(path.posix.basename(window.liandi.current.dir.url), window.liandi.current.path))}</div>
</div>`;
        backlinks.forEach((files) => {
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
        if (backlinks.length === 0) {
            backlinksHTML += `<div class="backlinks__title"><div class="ft__secondary ft__smaller">${i18n[window.liandi.config.lang].noBacklinks}</div></div>`;
        }
        this.element.innerHTML = backlinksHTML;
    }
}
