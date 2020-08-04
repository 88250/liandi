import {i18n} from '../i18n';
import {removeLastPath} from '../util/path';

export class Navigation {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('navigation');
    }

    public onRename(liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) {
        const fileItemElement = this.element.querySelector(`.file[path="${encodeURIComponent(data.oldPath)}"]`);
        fileItemElement.setAttribute('path', encodeURIComponent(data.newPath));
        fileItemElement.setAttribute('name', encodeURIComponent(data.newName));

        if (fileItemElement.getAttribute('current') === 'true') {
            liandi.current.path = data.newPath;

            if (!data.newPath.endsWith('/')) {
                (document.querySelector('.editors__input') as HTMLInputElement).value = data.newName.replace('.md', '');
            }
        }
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        if (data.files.length > 0) {
            const arrowElement = this.element.querySelector(`tree-list[url="${data.url}"]`).shadowRoot
                .querySelector(`.item__arrow[path="${data.path}"]`);
            arrowElement.setAttribute('has-file', 'true');
            arrowElement.setAttribute('files', JSON.stringify(data.files));
            arrowElement.innerHTML = '<path d="M6.125 28.25l12.25-12.25-12.25-12.25 3.75-3.75 16 16-16 16z"></path>';
        }
    }

    public onMount(data: { dir: IDir }) {
        this.element.insertAdjacentHTML('beforeend',
            `<tree-list url="${data.dir.url}" dir="${encodeURIComponent(JSON.stringify(data.dir))}"></tree-list>`);
    }
}
