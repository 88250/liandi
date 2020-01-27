export class Files {
    public element: HTMLElement
    private filesElement: HTMLElement
    private backElement: HTMLButtonElement

    constructor() {
        this.element = document.getElementById('files')
        this.filesElement = document.createElement('div')

        this.backElement = document.createElement('button')
        this.backElement.textContent = '返回上一层'
        this.backElement.addEventListener('click', () => {

        })

        this.element.appendChild(this.backElement)
        this.element.appendChild(this.filesElement)
    }

    onLs(liandi: ILiandi, data: { files: IFile[], url: string }) {
        let filesHTML = ''
        data.files.forEach((item: IFile) => {
            filesHTML += `<file-item dir="${item.isdir}" url="${data.url}" path="${item.path}" name="${item.name}"></file-item>`
        })
        this.filesElement.innerHTML = filesHTML
    }
}
