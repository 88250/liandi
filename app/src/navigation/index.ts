import {remote} from 'electron';
import {homedir} from 'os';
import {Constants} from '../constants';

export class Navigation {
    public element: HTMLElement;
    public listElement: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
        const btnElement = document.createElement('button');
        btnElement.innerHTML = '打开文件';
        btnElement.onclick = () => {
            this.mountWebDAVs(liandi);
        };

        this.listElement = document.createElement('div');
        this.listElement.className = 'navigation__list'

        this.element.appendChild(btnElement);
        this.element.appendChild(this.listElement);
    }

    private async mountWebDAVs(liandi: ILiandi) {
        const filePath = await remote.dialog.showOpenDialog({
            defaultPath: homedir(),
            properties: ['openDirectory', 'openFile'],
        });
        if (filePath.filePaths.length === 0) {
            return
        }
        liandi.ws.webSocket.send(JSON.stringify({
            'cmd': 'mount',
            'param': {
                'url': `${Constants.WEBDAV_ADDRESS}/`,
                'path': filePath.filePaths[0]
            }
        }));
    }

    public onMount(liandi: ILiandi, url: string) {
        const urls = url.split('/');
        const name = urls[urls.length - 2];
        this.listElement.insertAdjacentHTML('beforeend',
            `<file-item dir="true" path="/" name="${name}" url="${url}"></file-item>`);
    }
}
