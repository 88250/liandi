import "./assets/base.scss"
import {Navigation} from './navigation'
import {Files} from "./files";
import {WebSocketUtil} from "./websocket";

class App {

    public liandi: ILiandi

    constructor() {
        this.liandi = {
            webDAVs: [],
        }

        this.liandi.ws =  new WebSocketUtil(this.liandi)
        this.liandi.navigation =  new Navigation(this.liandi)
        this.liandi.files =  new Files(this.liandi)
    }
}

new App()
