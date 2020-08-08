import * as path from 'path';

export class Backlinks {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('backlinks');
    }

    public getBacklinks(liandi: ILiandi) {
        if (!this.element.classList.contains("fn__none")) {
            liandi.ws.send('backlinks', {
                url: liandi.current.dir.url,
                path: liandi.current.path
            });
        }
    }

    public onBacklinks(backlinks: IBacklinks[]) {
        let backlinksHTML = ''
        backlinks.forEach((files) => {
            backlinksHTML += "<h2>${files.path}</h2>"
            files.blocks.forEach(item => {
                backlinksHTML += `<div><span class="fn__flex"><span class="fn__flex-1 fn__a">${item.content}</span><span class="fn__space--s"></span>
<span class="ft__smaller ft__secondary">${path.posix.join(path.posix.basename(item.url), item.path)}</span></span></div>`
            })
        })
        this.element.innerHTML = backlinksHTML;
    }
}
