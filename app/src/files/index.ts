import {i18n} from '../i18n';
import {Constants} from '../constants';

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

    renderBack(url: string, path: string) {
        if (path === '/') {
            window.liandi.liandi.files.element.firstElementChild.innerHTML = '';
        } else {
            const lastPaths = path.substr(0, path.lastIndexOf('/')).lastIndexOf('/') + 1;
            window.liandi.liandi.files.element.firstElementChild.innerHTML =
                `<file-item class="list__item" name="${i18n[Constants.LANG].back}" path="${path.substring(
                    0, lastPaths)}"></file-item>`;
        }
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string }) {
        let filesHTML = '';
        data.files.forEach((item: IFile) => {
            let className = '';
            if (data.url === liandi.current.url && item.name === liandi.current.name && item.path === liandi.current.path) {
                className = ' current';
            }
            filesHTML += `<file-item class="list__item${className}" path="${item.path}" name="${item.name}"></file-item>`;
        });
        this.listElement.innerHTML = filesHTML;
    }

    public onRename(liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) {
        const fileItemElement = this.listElement.querySelector(`file-item[path="${data.oldPath}"]`);
        fileItemElement.setAttribute('path', data.newPath);
        fileItemElement.setAttribute('name', data.newName);

        if (fileItemElement.classList.contains('current')) {
            liandi.current.path = data.newPath;
            liandi.current.name = data.newName;

            if (fileItemElement.getAttribute('dir') === 'false') {
                liandi.editors.inputWrapElement.querySelector('input').value = data.newName;
            }
        }
    }
}
