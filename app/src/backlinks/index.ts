import * as path from 'path';

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

    public onBacklinks(backlinks: IBacklinks[]) {
        let backlinksHTML = ''
        backlinks.forEach((files) => {
            files.blocks.forEach((item, index) => {
                if (index === 0) {
                    backlinksHTML += `<h2 class="fn__a vditor-tooltipped vditor-tooltipped__nw" aria-label="${path.posix.basename(item.url)}">${path.posix.basename(files.path)}
<span class="ft__smaller ft__secondary">${path.posix.dirname(item.path)}</span></h2>`
                }
                backlinksHTML += `<div class="item ft__secondary">${item.content}</div>`
            })
        })
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
