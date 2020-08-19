import "./assets/scss/base.scss";
import "./components/tab-panel";
import "./icons/index";
import {ipcRenderer} from "electron";
import {Constants} from "./constants";
import {Layout} from "./layout";
import {Find} from "./search/Find";
import {doubleShift} from "./util/doubleShift";
import {genUUID} from "./util/genUUID";
import {Menus} from "./menus";
import {Model} from "./layout/Model";
import {processMessage} from "./util/processMessage";
import {onSearch} from "./search";
import {onSetTheme} from "./websocket/onSetTheme";
import {onGetConfig} from "./websocket/onGetConfig";
import {destroyDialog} from "./util/dialog";

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

        doubleShift();
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

        this.liandi = {
            find : new Find(),
            layout,
            ws: new Model({
                id: genUUID(),
                callback() {
                    this.send("getconf", {}, this.reqId);
                }
            }),
            menus: new Menus()
        };

        this.liandi.ws.ws.onmessage = (event) => {
            const data = processMessage(event.data, this.liandi.ws.reqId)
            if (data) {
                switch (data.cmd) {
                    case "search":
                        onSearch(data.data);
                        break;
                    case "searchblock":
                        // liandi.editors.showSearchBlock(liandi, response.data);
                        break;
                    case "searchget":
                        // liandi.editors.onGet(liandi, response.data);
                        // liandi.backlinks.getBacklinks(liandi);
                        break;
                    case "setimage":
                        // image.onSetImage(response.data);
                        break;
                    case "setlang":
                        window.location.reload();
                        break;
                    case "setmd":
                        // markdown.onSetMD(response.data);
                        break;
                    case "settheme":
                        onSetTheme(data.data);
                        break;
                    case "getconf":
                        onGetConfig(data.data);
                        onSetTheme(data.data.theme);
                        break;
                    case "put":
                        // liandi.backlinks.getBacklinks(liandi);
                        // liandi.graph.render(liandi);
                        break;
                    case "mount":
                    case "mountremote":
                        destroyDialog();
                        // liandi.navigation.onMount(liandi, response.data);
                        // liandi.graph.render(liandi);
                        break;
                    case "getblock":
                        // liandi.editors.onGetBlock(liandi, response.data);
                        break;
                    case "rename":
                        // liandi.navigation.onRename(liandi, response.data);
                        break;
                    case"remove":
                        // liandi.graph.render(liandi);
                        break;
                    case "create":
                    case "mkdir":
                        // if (response.cmd === "create") {
                        //     liandi.graph.render(liandi);
                        // }
                        // liandi.menus.itemData.target.firstElementChild.classList.remove("fn__hidden");
                        // if (liandi.menus.itemData.target.firstElementChild.classList.contains("item__arrow--open")) {
                        //     liandi.menus.itemData.target.firstElementChild.classList.remove("item__arrow--open");
                        //     liandi.menus.itemData.target.nextElementSibling.remove();
                        // }
                        // liandi.menus.itemData.target.setAttribute("data-files", JSON.stringify(response.data.files));
                        // liandi.navigation.getLeaf(liandi.menus.itemData.target, response.data.dir);
                        // destroyDialog();
                        // if (response.data.callback === Constants.CB_CREATE_INSERT) {
                        //     setSelectionFocus(liandi.editors.currentEditor.range);
                        //     liandi.editors.currentEditor.vditor.insertValue(`((${response.data.id} "${response.data.name}"))`);
                        // }
                        break;
                }
            }
        }
        //     window.onresize = () => {
        //         this.liandi.graph.resize();
        //         this.liandi.editors.resize();
        //     };
        window.liandi = this.liandi;
    }
}

new App();
