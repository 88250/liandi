import {i18n} from "../i18n";
import {Constants} from "../constants";

export class Files {
    public element: HTMLElement;
    public listElement: HTMLElement;

    constructor() {
        this.element = document.getElementById('files');
        this.listElement = document.createElement('div');
        this.listElement.className = 'files__list';

        const backElement = document.createElement('div');

        this.element.appendChild(backElement);
        this.element.appendChild(this.listElement);
    }

    renderBack(url: string, path: string) {
        if (path === '/') {
            window.liandi.liandi.files.element.firstElementChild.innerHTML = ''
        } else {
            const lastPaths = path.substr(0, path.lastIndexOf('/')).lastIndexOf('/') + 1
            window.liandi.liandi.files.element.firstElementChild.innerHTML =
                `<file-item dir="true" name="${i18n[Constants.LANG].back}" url="${url}" path="${path.substring(
                    0, lastPaths)}"></file-item>`
        }
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string }) {
        let filesHTML = '';
        data.files.forEach((item: IFile) => {
            filesHTML += `<file-item dir="${item.isdir}" url="${data.url}" path="${item.path}" name="${item.name}"></file-item>`;
        });
        this.listElement.innerHTML = filesHTML;
    }
}
