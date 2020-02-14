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

declare interface IDir {
    auth: string;
    password: string;
    path: string;
    url: string;
    user: string;
}

declare interface IMD {
    autoSpace: boolean;
    chinesePunct: boolean;
    fixTermTypo: boolean;
    inlineMathAllowDigitAfterOpenMarker: boolean;
    mathEngine: 'KaTeX' | 'MathJax';
}

declare interface ILiandi {
    config?: {
        lang: keyof II18n
        theme: 'white' | 'dark',
        markdown: IMD
    };
    componentCSS: string;
    ws?: {
        webSocket: WebSocket,
        send: (cmd: string, param: any, process?: boolean) => void
    };
    navigation?: {
        element: HTMLElement
        onLsd: (liandi: ILiandi, data: { files: IFile[], url: string, path: string }) => void
        onMount: (data: { dir: object }) => void
    };
    files?: {
        listElement: HTMLElement
        element: HTMLElement
        onLs: (liandi: ILiandi, data: { files: IFile[], url: string, path: string }) => void
        onRename: (liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) => void
    };
    editors?: {
        element: HTMLElement
        inputElement: HTMLInputElement
        saved: boolean
        vditor: any
        saveContent: (liandi: ILiandi) => void
        remove: (liandi: ILiandi) => void
        onGet: (liandi: ILiandi, file: { name: string, content: string }) => void
        reload: (liandi: ILiandi) => void
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
        dir?: IDir
        path?: string
    };
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}
