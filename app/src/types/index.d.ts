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
    hideToolbar: boolean;
}

declare interface ILiandi {
    config?: {
        lang: keyof II18n
        theme: 'light' | 'dark',
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
        save: (liandi:ILiandi) => void;
        close: (liandi:ILiandi) => void;
        sendMessage: (message: string, liandi: ILiandi, editorData?: { content: string, name: string }) => void;
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
    find?: {
        open: (key?: string, index?: number) => void
    };
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}
