export class Files {
    public element: HTMLElement

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('files')
    }

    render(liandi: ILiandi, url: string) {
        liandi.webDAVs.find(item => {
            if (item.url === url) {
                item.connection.readdir(url, (e, files) => {
                    let filesHTML = ''
                    files.forEach((fileName: string) => {
                        filesHTML += fileName
                    })
                    this.element.innerHTML = filesHTML
                })
            }
        })
    }
}
