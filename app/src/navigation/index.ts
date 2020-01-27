import {remote} from "electron";
import {homedir} from "os";
import {Constants} from "../constants";
import {Connection} from "webdav-client";
import {delegate} from "../util/delegate";

export class Navigation {
    public element: HTMLElement;
    private listElement: HTMLElement

    constructor(liandi: ILiandi) {
        this.element = document.getElementById("navigation")
        const btnElement = document.createElement('button')
        btnElement.innerHTML = '打开文件'
        btnElement.onclick = () => {
            this.openWebDAVs(liandi)
        }

        this.listElement = document.createElement("div")
        delegate(this.listElement, "click", "div",  (target)=>{
            liandi.files.render(liandi, target.getAttribute('data-url'))
        })

        this.element.appendChild(btnElement)
        this.element.appendChild(this.listElement)
    }

    private async openWebDAVs(liandi: ILiandi) {
        const filePath = await remote.dialog.showOpenDialog({
            defaultPath: homedir(),
            properties: ['openDirectory'],
        })

        liandi.ws.webSocket.send(JSON.stringify({
            "cmd": "opendir",
            "param": {
                "url": `${Constants.WEBDAV_ADDRESS}/`,
                "path": filePath.filePaths[0]
            }
        }))
    }

    public onmessage(liandi: ILiandi, url: string) {
        liandi.webDAVs.push({
            url,
            connection: new Connection(url)
        })
        const urls = url.split('/')
        this.listElement.insertAdjacentHTML('beforeend',
            `<div data-url="${url}">${urls[urls.length - 2]}</div>`)
    }
}

