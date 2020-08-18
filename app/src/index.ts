import "./assets/scss/base.scss";
import "./components/tab-panel";
import "./icons/index";
import {ipcRenderer} from "electron";
import {Constants} from "./constants";
import {Layout} from "./layout";
import {WebSocketUtil} from "./websocket";
import {Find} from "./search/Find";
import {doubleShift} from "./util/doubleShift";
import {genUUID} from "./util/genUUID";

class App {
    public liandi: ILiandi;

    constructor() {
        const layouts = [
            new Layout({direction: "lr", size: "6px"}),
            new Layout({direction: "lr", size: (window.innerHeight - 32) + "px", resize: "tb"}),
            new Layout({direction: "lr", resize: "tb"}),
        ];
        layouts[1].children = [
            new Layout({parent: layouts[1], size: "6px"}),
            new Layout({parent: layouts[1], size: (window.innerWidth - 12) + "px", resize: "lr"}),
            new Layout({parent: layouts[1], resize: "lr"}),
        ];

        this.liandi = {
            layouts
        };
        this.liandi.ws = new WebSocketUtil(genUUID(), (ws: WebSocketUtil) => {
            ws.send("getconf", {});
            this.liandi.find = new Find();
            doubleShift();
            this.onIpc();
        });

        //     window.onresize = () => {
        //         this.liandi.graph.resize();
        //         this.liandi.editors.resize();
        //     };
        window.liandi = this.liandi;
    }

    private onIpc() {
        // 监听主线程发送的消息
        ipcRenderer.on(Constants.LIANDI_FIND_SHOW, () => {
            this.liandi.find.open();
        });
        ipcRenderer.on(Constants.LIANDI_EDITOR_SAVE, () => {
            // TODO this.liandi.editors.save(this.liandi);
        });
        ipcRenderer.on(Constants.LIANDI_FILE_NEW, () => {
            // TODO newFile(this.liandi)
        });
    }
}

new App();
