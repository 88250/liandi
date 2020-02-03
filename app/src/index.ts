import './assets/scss/base.scss';
import {Navigation} from './navigation';
import {Files} from './files';
import {WebSocketUtil} from './websocket';
import './components/file-item';
import './components/tree-list';
import './components/tab-panel';
import './icons/index';
import {Editors} from './editors';
import {Menus} from './menu';
import {resize} from './util/resize';
import {initGlobalKeyPress} from "./hotkey";

class App {
    public liandi: ILiandi;

    constructor() {
        this.liandi = {
            current: {
                path: '',
            },
            componentCSS: require('../dist/components.css')[0][1]
        };
        this.liandi.ws =  new WebSocketUtil(this.liandi);
        this.liandi.navigation =  new Navigation();
        this.liandi.files =  new Files();
        this.liandi.editors =  new Editors(this.liandi);
        this.liandi.menus = new Menus(this.liandi);

        resize('resize');
        resize('resize2');

        initGlobalKeyPress()
    }
}

window.liandi = new App();
