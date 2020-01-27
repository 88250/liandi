interface Window {
    liandi: {
        liandi: ILiandi
    };
}

declare interface IFile {
    path: string,
    name: string,
    isdir: boolean
}

declare interface ILiandi {
    ws?: {
        webSocket: WebSocket
    };
    navigation?: {
        element: HTMLElement
        onMount: (liandi: ILiandi, url: string) => void
    }
    files?: {
        element: HTMLElement
        onLs: (liandi: ILiandi, data: { files: IFile[], url: string }) => void
    }
    editors?: {
        url?: string
        path?: string
        element: HTMLElement
        onGet: (liandi: ILiandi, content: string) => void
    }
}

interface IEvent extends Event {
    target: HTMLElement & EventTarget;
}
