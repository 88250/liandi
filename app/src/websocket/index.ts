import {Constants} from "../constants";
import {showMessage} from "../util/message";
import {destroyDialog} from "../util/dialog";
import {onSearch} from "../search";
import {markdown} from "../config/markdown";
import {image} from "../config/image";
import {onGetConfig} from "./onGetConfig";
import {onSetTheme} from "./onSetTheme";

export class WebSocketUtil {
    private webSocket: WebSocket;
    private reqId: number;
    private model: any;

    constructor(model:any, callback: () => void) {
        this.model = model;
        this.connect(callback);
    }

    public send(cmd: string, param: Record<string, unknown>, process = false) {
        this.reqId = process ? 0 : new Date().getTime();
        this.webSocket.send(JSON.stringify({
            cmd,
            reqId: this.reqId,
            param,
        }));
    }

    private connect(callback?: () => void) {
        const liandi = window.liandi;
        this.webSocket = new WebSocket(`${Constants.WEBSOCKET_ADDREDD}?id=${this.model.parent.id}`);
        this.webSocket.onopen = () => {
            if (callback) {
                callback();
            }
        };
        this.webSocket.onclose = (e) => {
            console.warn("WebSocket is closed. Reconnect will be attempted in 1 second.", e);
            setTimeout(() => {
                this.connect();
            }, 1000);
        };
        this.webSocket.onerror = (err) => {
            console.error("WebSocket Error:", err);
            this.webSocket.close();
        };
        this.webSocket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if ("msg" === response.cmd) {
                showMessage(response.msg, response.data.closeTimeout);
                return;
            }

            if (response.reqId !== this.reqId) {
                return;
            }

            if (response.code !== 0) {
                showMessage(response.msg, 0);
                return;
            }
            switch (response.cmd) {
                case "graph":
                    this.model.onGraph(response.data);
                    break;
                case "search":
                    onSearch(liandi, response.data);
                    break;
                case "searchblock":
                    // liandi.editors.showSearchBlock(liandi, response.data);
                    break;
                case "searchget":
                    // liandi.editors.onGet(liandi, response.data);
                    // liandi.backlinks.getBacklinks(liandi);
                    break;
                case "setimage":
                    image.onSetImage(liandi, response.data);
                    break;
                case "setlang":
                    window.location.reload();
                    break;
                case "setmd":
                    markdown.onSetMD(liandi, response.data);
                    break;
                case "settheme":
                    onSetTheme(response.data);
                    break;
                case "getconf":
                    onGetConfig(response.data);
                    onSetTheme(response.data.theme);
                    break;
                case "put":
                    // liandi.backlinks.getBacklinks(liandi);
                    // liandi.graph.render(liandi);
                    break;
                case "backlinks":
                    // liandi.backlinks.onBacklinks(liandi, response.data.backlinks);
                    break;
                case "mount":
                case "mountremote":
                    destroyDialog();
                    // liandi.navigation.onMount(liandi, response.data);
                    // liandi.graph.render(liandi);
                    break;
                case "ls":
                    this.model.onLs(liandi, response.data);
                    break;
                case "get":
                    this.model.initVditor(response.data.content);
                    // liandi.editors.onGet(liandi, response.data);
                    // liandi.backlinks.getBacklinks(liandi);
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
        };
    }
}
