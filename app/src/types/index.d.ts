interface Window {
    liandi: {
        liandi: ILiandi
    };
}

declare interface IFile {
    path: string;
    name: string;
    isdir: boolean;
}

declare interface ILiandi {
    ws?: {
        webSocket: WebSocket
    };
    navigation?: {
        element: HTMLElement
        listElement: HTMLElement
        onMount: (liandi: ILiandi, url: string) => void
    };
    files?: {
        renderBack: (url: string, path: string) => void
        listElement: HTMLElement
        element: HTMLElement
        onLs: (liandi: ILiandi, data: { files: IFile[], url: string }) => void
        onRename: (liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) => void
    };
    editors?: {
        url?: string
        path?: string
        inputWrapElement: HTMLElement
        remove: (liandi: ILiandi) => void
        onGet: (liandi: ILiandi, file: { name: string, content: string }) => void
    };
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}
