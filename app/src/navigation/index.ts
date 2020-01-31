export class Navigation {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('navigation');
    }

    public onLsd(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        if (data.files.length > 0) {
            const arrowElement = this.element.querySelector(`tree-list[url="${data.url}"]`).shadowRoot
                .querySelector(`.arrow[path="${data.path}"]`)
            arrowElement.setAttribute('has-file', 'true')
            arrowElement.setAttribute('files', JSON.stringify(data.files))
            arrowElement.innerHTML = '<path d="M21.875 14c0 0.465-0.191 0.902-0.52 1.23l-12.25 12.25c-0.328 0.328-0.766 0.52-1.23 0.52-0.957 0-1.75-0.793-1.75-1.75v-24.5c0-0.957 0.793-1.75 1.75-1.75 0.465 0 0.902 0.191 1.23 0.52l12.25 12.25c0.328 0.328 0.52 0.766 0.52 1.23z"></path>'
        }
    }

    public onMount(data: { url: string, remote: boolean }) {
        this.element.insertAdjacentHTML('beforeend',
            `<tree-list remote="${data.remote.toString()}" url="${data.url}"></tree-list>`);
    }
}
