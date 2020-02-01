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
    componentCSS: string;
    ws?: {
        webSocket: WebSocket,
        send: (cmd: string, param: any) => void
    };
    navigation?: {
        element: HTMLElement
        onLsd: (liandi: ILiandi, data: { files: IFile[], url: string, path: string }) => void
        onMount: (data: { url: string, remote: boolean }) => void
    };
    files?: {
        listElement: HTMLElement
        element: HTMLElement
        onLs: (liandi: ILiandi, data: { files: IFile[], url: string, path: string }) => void
        onRename: (liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) => void
    };
    editors?: {
        element: HTMLElement
        inputWrapElement: HTMLElement
        saveContent: (liandi: ILiandi) => void
        remove: (liandi: ILiandi) => void
        onGet: (liandi: ILiandi, file: { name: string, content: string }) => void
    };
    menus?: {
        itemData: {
            target?: HTMLElement
            name?: string
            url: string
            path?: string
        }
    };
    current?: {
        url: string
        path: string
    };
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}
