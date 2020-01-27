declare interface IWebdav {
    url: string,
    connection: Connection
}

declare class Connection {
    get(path: string, callback: (error?: Error, body?: string) => void): void;

    readdir(path: string, callback: (error: Error, files?: string[]) => void): void;
}

declare interface ILiandi {
    webDAVs: IWebdav[]
    ws?: {
        webSocket: WebSocket
    };
    navigation?: {
        element: HTMLElement
        onmessage: (liandi: ILiandi, url: string) => void
    }
    files?: {
        element: HTMLElement
        render: (liandi:ILiandi, url:string) => void
    }
}

interface IEvent extends Event {
    target: HTMLElement & EventTarget;
}
