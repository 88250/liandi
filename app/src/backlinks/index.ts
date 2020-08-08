import * as path from 'path';
import {i18n} from "../i18n";

export class Backlinks {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('backlinks');
    }

    public getBacklinks(liandi: ILiandi) {
        if (liandi.current.dir && !this.element.classList.contains("fn__none")) {
            liandi.ws.send('backlinks', {
                url: liandi.current.dir.url,
                path: liandi.current.path
            });
        }
    }

    public onBacklinks(liandi: ILiandi, backlinks: IBacklinks[]) {
        let backlinksHTML = `<div class="backlinks__title">
<div class="ft__secondary ft__smaller">${i18n[liandi.config.lang].backlinks}</div>
<span>${path.posix.join(path.posix.basename(liandi.current.dir.url), liandi.current.path)}</span>
</div>`
        backlinks.forEach((files) => {
            backlinksHTML += '<div class="item">'
            files.blocks.forEach((item, index) => {
                if (index === 0) {
                    backlinksHTML += `<h2 class="fn__flex vditor-tooltipped__nw vditor-tooltipped" aria-label="${path.posix.basename(item.url)}">
<span class="fn__flex-1">${path.posix.basename(files.path)}</span>
<span class="ft__smaller fn__flex-center">${path.posix.dirname(item.path).substr(1)}</span>
</h2>`
                }
                backlinksHTML += `<div class="item__content">${item.content}</div>`
            })
            backlinksHTML += '</div>'
        })
        if (backlinks.length === 0) {
            backlinksHTML += `<div class="item"><div class="item__content">${i18n[liandi.config.lang].noBacklinks}</div></div>`
        }
        this.element.innerHTML = backlinksHTML;
    }

    public show(liandi: ILiandi) {
        this.element.classList.remove('fn__none');
        this.getBacklinks(liandi);
        document.getElementById('resize2').classList.remove('fn__none');
    }

    public hide() {
        this.element.classList.add('fn__none');
        document.getElementById('resize2').classList.add('fn__none');
    }
}
