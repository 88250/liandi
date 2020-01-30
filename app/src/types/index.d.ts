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
        element: HTMLElement
        inputWrapElement: HTMLElement
        remove: (liandi: ILiandi) => void
        onGet: (liandi: ILiandi, file: { name: string, content: string }) => void
    };
    menus?: {
        itemData: {
            target?: HTMLElement
            name?: string
            url: string
            path: string
        }
    },
    current?: {
        url: string
        path: string
        name: string
    }
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}
