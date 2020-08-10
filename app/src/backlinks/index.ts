import * as path from 'path';
import {i18n} from "../i18n";

export class Backlinks {
    public element: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('backlinks');
        this.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement
            while (target && !target.isEqualNode(this.element)) {
                if (target.tagName === "H2") {
                    liandi.editors.save(liandi);
                    liandi.current = {
                        dir: {url: decodeURIComponent(target.getAttribute('data-url'))},
                        path: decodeURIComponent(target.getAttribute('data-path'))
                    }
                    liandi.ws.send('get', {
                        url: liandi.current.dir.url,
                        path: liandi.current.path
                    })
                    event.preventDefault()
                    event.stopPropagation()
                    break
                }
                target = target.parentElement
            }
        })
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
                    backlinksHTML += `<h2 data-type="backlinks-file" data-path="${encodeURIComponent(item.path)}" data-url="${encodeURIComponent(item.url)}" class="fn__flex"">
<span class="fn__flex-1">${path.posix.basename(files.path)}</span>
<span class="ft__smaller fn__flex-center">${path.posix.dirname(item.path).substr(1)}</span>
</h2>`
                }
                backlinksHTML += `<div class="item__content fn__two-line">${item.content}</div>`
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
