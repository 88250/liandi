import {getName} from '../util/path';

export class Navigation {
    public element: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
    }

    public onMount(liandi: ILiandi, url: string) {
        this.element.insertAdjacentHTML('beforeend',
            `<file-item class="list__item" dir="true" path="/" name="${getName(url)}" url="${url}"></file-item>`);
    }
}
