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
        const layout = new Layout({element: document.getElementById("layouts")});
        layout.addLayout(new Layout({direction: "lr", size: "6px", type: "top"}));
        layout.addLayout(new Layout({direction: "lr", size: (window.innerHeight - 32) + "px", resize: "tb"}));
        layout.addLayout(new Layout({direction: "lr", resize: "tb", type: "bottom"}));

        (layout.children[1] as Layout).addLayout(new Layout({size: "6px", type: "left"}));
        (layout.children[1] as Layout).addLayout(new Layout({
            size: (window.innerWidth - 12) + "px",
            resize: "lr",
            type: "center"
        }));
        (layout.children[1] as Layout).addLayout(new Layout({resize: "lr", type: "right"}));

        this.liandi = {
            layout,
            ws: new WebSocketUtil({parent: {id: genUUID()}}, () => {
                this.liandi.ws.send("getconf", {});
                this.liandi.find = new Find();
                doubleShift();
                this.onIpc();
            })
        };
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
