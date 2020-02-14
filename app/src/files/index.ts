import {i18n} from '../i18n';
import {Constants} from '../constants';
import {removeLastPath} from '../util/path';

export class Files {
    public element: HTMLElement;
    public listElement: HTMLElement;

    constructor() {
        this.element = document.getElementById('files');
        this.listElement = document.createElement('div');
        this.listElement.className = 'files__list';

        const backElement = document.createElement('div');
        backElement.className = 'files__back';

        this.element.appendChild(backElement);
        this.element.appendChild(this.listElement);
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        let filesHTML = '';
        data.files.forEach((item: IFile) => {
            let current = 'false';
            if (data.url === liandi.current.dir.url && item.path === liandi.current.path) {
                current = 'true';
            }
            filesHTML += `<file-item current="${current}" path="${item.path}" name="${item.name}"></file-item>`;
        });
        this.listElement.innerHTML = filesHTML;

        if (data.path === '/') {
            this.element.firstElementChild.innerHTML = '';
        } else {
            this.element.firstElementChild.innerHTML =
                `<file-item name="${i18n[liandi.config.lang].back}" path="${removeLastPath(data.path)}"></file-item>
<div class="files__path">${liandi.current.path}</div>`;
        }
    }

    public onRename(liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) {
        const fileItemElement = this.listElement.querySelector(`file-item[path="${data.oldPath}"]`);
        fileItemElement.setAttribute('path', data.newPath);
        fileItemElement.setAttribute('name', data.newName);

        if (fileItemElement.getAttribute('current') === 'true') {
            liandi.current.path = data.newPath;

            if (!data.newPath.endsWith('/')) {
                liandi.editors.inputElement.value = data.newName;
            }
        }
    }
}
