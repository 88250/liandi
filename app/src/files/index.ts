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

    onLs(liandi: ILiandi, data: { files: IFile[], url: string }) {
        let filesHTML = '';
        data.files.forEach((item: IFile) => {
            filesHTML += `<file-item dir="${item.isdir}" url="${data.url}" path="${item.path}" name="${item.name}"></file-item>`;
        });
        this.listElement.innerHTML = filesHTML;
    }
}
