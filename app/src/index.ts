import "./assets/scss/base.scss";
import "./components/tab-panel";
import "./icons/index";
import {ipcRenderer} from "electron";
import {Constants} from "./constants";
import {Layout} from "./layout";
import {Find} from "./search/Find";
import {globalShortcut} from "./util/globalShortcut";
import {genUUID} from "./util/genUUID";
import {Menus} from "./menus";
import {Model} from "./layout/Model";
import {processMessage} from "./util/processMessage";
import {onSearch} from "./search";
import {onSetTheme} from "./websocket/onSetTheme";
import {onGetConfig} from "./websocket/onGetConfig";
import {image} from "./config/image";
import {markdown} from "./config/markdown";
import {showMessage} from "./util/message";
import {newFile} from "./util/newFile";
import {getAllModels, resizeTabs} from "./layout/util";
import {addScript} from "../vditore/src/ts/util/addScript";
import * as path from "path";
import {animationThrottle} from "./util/animationThrottle";
import {destroyDialog} from "./util/dialog";
import {openFile} from "./editor/util";
import {exportFile} from "./util/download";

class App {
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

        globalShortcut();
        // 监听主线程发送的消息
        ipcRenderer.on(Constants.LIANDI_FIND_SHOW, () => {
            liandi.find.open();
        });
        ipcRenderer.on(Constants.LIANDI_FILE_NEW, () => {
            newFile(undefined, Constants.CB_CREATE_HOTKEY);
        });

        const liandi: ILiandi = {
            ctrlIsPressed: false,
            find: new Find(),
            layout,
            topLayout: layout.children[0] as Layout,
            leftLayout: layout.children[1].children[0] as Layout,
            centerLayout: layout.children[1].children[1] as Layout,
            rightLayout: layout.children[1].children[2] as Layout,
            bottomLayout: layout.children[2] as Layout,
            ws: new Model({
                id: genUUID(),
                callback() {
                    this.send("getconf", {});
                }
            }),
            menus: new Menus()
        };

        liandi.ws.ws.onmessage = (event) => {
            const data = processMessage(event.data);
            if (data) {
                switch (data.cmd) {
                    case "exportmd":
                        exportFile(data.data.content, data.data.name);
                        break;
                    case "search":
                        onSearch(data.data);
                        break;
                    case "checkupdate":
                        showMessage(data.msg);
                        break;
                    case "setimage":
                        image.onSetImage(data.data);
                        break;
                    case "setlang":
                        window.location.reload();
                        break;
                    case "setmd":
                        markdown.onSetMD(data.data);
                        break;
                    case "settheme":
                        onSetTheme(data.data);
                        break;
                    case "create":
                        // 没有文件树展开
                        if (getAllModels().files.length === 0) {
                            destroyDialog();
                            if (data.callback !== Constants.CB_CREATE_INSERT) {
                                openFile(data.data.box.url, data.data.path);
                            }
                        }
                        break;
                    case "getconf":
                        if (data.callback === Constants.CB_GETCONF_BOX) {
                            window.liandi.config = data.data;
                        } else {
                            onGetConfig(data.data);
                            onSetTheme(data.data.theme);
                        }
                        break;
                }
            }
        };
        window.liandi = liandi;

        setTimeout(() => {
            // 需等待重绘完成后
            window.liandi.rightLayoutWidth = liandi.rightLayout.element.clientWidth;
            window.liandi.bottomLayoutHeight = liandi.bottomLayout.element.clientHeight;
        }, 100);

        animationThrottle("resize", "optimizedResize", window);
        window.addEventListener("optimizedResize", () => {
            window.liandi.layout.children[1].element.style.height = window.innerHeight - window.liandi.topLayout.element.clientHeight - window.liandi.bottomLayoutHeight - 20 + "px";
            window.liandi.centerLayout.element.style.width = window.innerWidth - window.liandi.leftLayout.element.clientWidth - window.liandi.rightLayoutWidth + "px";
            resizeTabs();
        });

        addScript(`${path.posix.join(Constants.APP_DIR, "vditore")}/dist/js/icons/material.js`, "vditorIconScript");
    }
}

new App();
