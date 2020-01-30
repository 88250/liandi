export class Navigation {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('navigation');
    }

    public onMount(data: { url: string, remote: boolean }) {
        this.element.insertAdjacentHTML('beforeend',
            `<tree-item class="list__item" remote="${data.remote.toString()}" url="${data.url}"></tree-item>`);
    }
}
