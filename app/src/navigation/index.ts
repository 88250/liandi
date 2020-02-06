export class Navigation {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('navigation');
    }

    public onLsd(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        if (data.files.length > 0) {
            const arrowElement = this.element.querySelector(`tree-list[url="${data.url}"]`).shadowRoot
                .querySelector(`.tree-list__arrow[path="${data.path}"]`);
            arrowElement.setAttribute('has-file', 'true');
            arrowElement.setAttribute('files', JSON.stringify(data.files));
            arrowElement.innerHTML = '<path d="M25 16c0 0.531-0.219 1.031-0.594 1.406l-14 14c-0.375 0.375-0.875 0.594-1.406 0.594-1.094 0-2-0.906-2-2v-28c0-1.094 0.906-2 2-2 0.531 0 1.031 0.219 1.406 0.594l14 14c0.375 0.375 0.594 0.875 0.594 1.406z"></path>';
        }
    }

    public onMount(data: { dir: IDir }) {
        this.element.insertAdjacentHTML('beforeend',
            `<tree-list url="${data.dir.url}" dir="${encodeURIComponent(JSON.stringify(data.dir))}"></tree-list>`);
    }
}
