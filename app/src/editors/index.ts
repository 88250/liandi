export class Editors {
    public element: HTMLElement

    constructor() {
        this.element = document.getElementById('editors')
    }

    onGet(liandi: ILiandi, context:string) {
        this.element.innerHTML = context
    }
}
