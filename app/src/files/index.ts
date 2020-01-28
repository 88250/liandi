export class Files {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById('files');
        const filesElement = document.createElement('div');

        const backElement = document.createElement('div');

        this.element.appendChild(backElement);
        this.element.appendChild(filesElement);
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string }) {
        let filesHTML = '';
        data.files.forEach((item: IFile) => {
            filesHTML += `<file-item dir="${item.isdir}" url="${data.url}" path="${item.path}" name="${item.name}"></file-item>`;
        });
        this.element.lastElementChild.innerHTML = filesHTML;
    }
}
