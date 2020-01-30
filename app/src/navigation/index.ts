import {getName} from '../util/path';

export class Navigation {
    public element: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
    }

    public onMount(liandi: ILiandi, data: { url: string, remote: boolean }) {
        this.element.insertAdjacentHTML('beforeend',
            `<file-item class="list__item" dir="true" remote="${data.remote.toString()}" path="/" name="${getName(data.url)}" url="${data.url}"></file-item>`);
    }
}
