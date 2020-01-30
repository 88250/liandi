import {remote} from 'electron';
import {homedir} from 'os';
import {Constants} from '../constants';
import {getName} from '../util/path';
import {i18n} from "../i18n";

export class Navigation {
    public element: HTMLElement;
    public listElement: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
        const btnElement = document.createElement('div');
        btnElement.className = 'navigation__action'
        btnElement.innerHTML = `<button class="button button--confirm button--mid">${i18n[Constants.LANG].open}</button>`
        btnElement.querySelector('button').onclick = () => {
            this.mountWebDAVs(liandi);
        };

        this.listElement = document.createElement('div');
        this.listElement.className = 'navigation__list';

        this.element.appendChild(btnElement);
        this.element.appendChild(this.listElement);
    }

    private async mountWebDAVs(liandi: ILiandi) {
        const filePath = await remote.dialog.showOpenDialog({
            defaultPath: homedir(),
            properties: ['openDirectory', 'openFile'],
        });
        if (filePath.filePaths.length === 0) {
            return;
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
        this.listElement.insertAdjacentHTML('beforeend',
            `<file-item dir="true" path="/" name="${getName(url)}" url="${url}"></file-item>`);
    }
}
