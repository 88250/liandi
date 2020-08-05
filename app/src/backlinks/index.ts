export class Backlinks {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('backlinks');
    }

    public onBacklinks(backlinks: IBacklinks[]) {
        let backlinksHTML = ''
        backlinks.forEach((files) => {
            backlinksHTML += "<h2>${files.path}</h2>"
            files.blocks.forEach(item => {
                backlinksHTML += `<div><span class="fn__flex"><span>${item.content} </span>
                <span class="fn__flex-1 ft__smaller">${item.path}</span><span class="ft__smaller ft__secondary">${item.url}</span></span></div>`
            })
        })
        this.element.innerHTML = backlinksHTML;
    }
}
