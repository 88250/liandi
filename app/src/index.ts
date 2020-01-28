import './assets/base.scss';
import {Navigation} from './navigation';
import {Files} from './files';
import {WebSocketUtil} from './websocket';
import './components/fileItem';
import {Editors} from './editors';
import {Menus} from './menu';
import {resize} from "./util/resize";

class App {
    public liandi: ILiandi;

    constructor() {
        this.liandi = {};
        this.liandi.ws =  new WebSocketUtil(this.liandi);
        this.liandi.navigation =  new Navigation(this.liandi);
        this.liandi.files =  new Files();
        this.liandi.editors =  new Editors(this.liandi);
        const menus = new Menus(this.liandi);

        resize('resize')
        resize('resize2')
    }
}

window.liandi = new App();
