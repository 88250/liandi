import './assets/base.scss';
import {Navigation} from './navigation';
import {Files} from './files';
import {WebSocketUtil} from './websocket';
import './components/file-item';
import './components/tree-list';
import './icons/index';
import {Editors} from './editors';
import {Menus} from './menu';
import {resize} from './util/resize';

class App {
    public liandi: ILiandi;

    constructor() {
        this.liandi = {
            current: {
                url: '',
                path: '',
                name: ''
            }
        };
        this.liandi.ws =  new WebSocketUtil(this.liandi);
        this.liandi.navigation =  new Navigation();
        this.liandi.files =  new Files();
        this.liandi.editors =  new Editors(this.liandi);
        this.liandi.menus = new Menus(this.liandi);

        resize('resize');
        resize('resize2');
    }
}

window.liandi = new App();
