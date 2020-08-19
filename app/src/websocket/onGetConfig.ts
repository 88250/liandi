import {Layout} from "../layout";
import {Wnd} from "../layout/wnd";
import {i18n} from "../i18n";
import {initSearch} from "../search";
import {remote} from "electron";
import {WebSocketUtil} from "./index";
import {addCenterWnd} from "../layout/util";
import {Constants} from "../constants";
import * as path from "path";
import {Graph} from "../graph";
import {Tab} from "../layout/Tab";
import {Files} from "../files";
import {Backlinks} from "../backlinks";

export const onGetConfig = (data: IConfig) => {
    window.liandi.config = data;
    document.title = i18n[window.liandi.config.lang].slogan;
    initBar();
    initWindow();
    addCenterWnd();
};

const initBar = () => {
    document.querySelector(".toolbar").innerHTML = `<div id="barNavigation" class="item fn__a">
            <svg>
                <use xlink:href="#iconFolder"></use>
            </svg>
            ${i18n[window.liandi.config.lang].fileTree}
        </div>
        <div id="barBacklinks" class="item fn__a">
            <svg>
                <use xlink:href="#iconLink"></use>
            </svg>${i18n[window.liandi.config.lang].backlinks}
        </div>
        <div id="barGraph" class="item fn__a">
            <svg>
                <use xlink:href="#iconGraph"></use>
            </svg>${i18n[window.liandi.config.lang].graphView}
        </div>
        <div class="fn__flex-1" id="drag"></div>
        <a href="https://hacpai.com/sponsor" class="item ft__pink">
            <svg>
                <use xlink:href="#iconFavorite"></use>
            </svg>${i18n[window.liandi.config.lang].sponsor}
        </a>
        <div id="barHelp" class="item fn__a">
            <svg>
                <use xlink:href="#iconHelp"></use>
            </svg>${i18n[window.liandi.config.lang].help}
        </div>
        <div id="barBug" class="item fn__a">
            <svg>
                <use xlink:href="#iconBug"></use>
            </svg>${i18n[window.liandi.config.lang].debug}
        </div>
        <div id="barSettings" class="item fn__a">
            <svg>
                <use xlink:href="#iconSettings"></use>
            </svg>${i18n[window.liandi.config.lang].config}
        </div>`;
    document.getElementById("barNavigation").addEventListener("click", () => {
        const leftLayout = (window.liandi.layout.children[1] as Layout).children[0] as Layout;
        const wnd = new Wnd( leftLayout.children.length === 0 ? undefined : "tb");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconFolder"></use></svg> ${i18n[window.liandi.config.lang].fileTree}`,
            callback(tab: Tab) {
                if (leftLayout.element.clientWidth < 7) {
                    leftLayout.parent.children[1].element.style.width = (leftLayout.parent.children[1].element.clientWidth - 200) + "px";
                    leftLayout.element.style.width = "206px";
                }
                tab.addModel(new Files(tab));
            }
        });
        wnd.addTab(tab);
        leftLayout.addWnd(wnd);
        window.dispatchEvent(new CustomEvent("resize"));
    });

    document.getElementById("barGraph").addEventListener("click", function () {
        const topLayout = window.liandi.layout.children[0] as Layout;
        const wnd = new Wnd(topLayout.children.length === 0 ? undefined : "lr");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg> ${i18n[window.liandi.config.lang].graphView}`,
            panel: '<div class="graph__input"><input class="input"></div><div class="fn__flex-1"></div>',
            callback(tab: Tab) {
                if (topLayout.element.clientHeight < 7) {
                    topLayout.parent.children[1].element.style.height = (topLayout.parent.children[1].element.clientHeight - 200) + "px";
                    topLayout.element.style.height = "206px";
                }
                tab.addModel(new Graph(tab));
            }
        });
        wnd.addTab(tab);
        topLayout.addWnd(wnd);
        window.dispatchEvent(new CustomEvent("resize"));
    });

    document.getElementById("barBacklinks").addEventListener("click", function () {
        const rightLayout =(window.liandi.layout.children[1] as Layout).children[2] as Layout;
        const wnd = new Wnd(rightLayout.children.length === 0 ? undefined : "tb");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconLink"></use></svg> ${i18n[window.liandi.config.lang].backlinks}`,
            callback(tab: Tab) {
                if (rightLayout.element.clientWidth < 7) {
                    rightLayout.parent.children[1].element.style.width = (rightLayout.parent.children[1].element.clientWidth - 200) + "px";
                    rightLayout.element.style.width = "206px";
                }
                tab.addModel(new Backlinks(tab));
            }
        });
        wnd.addTab(tab);
        rightLayout.addWnd(wnd);
        window.dispatchEvent(new CustomEvent("resize"));
    });
    document.getElementById("barHelp").addEventListener("click", function () {
        window.liandi.ws.send("mount", {
            url: `${Constants.WEBDAV_ADDRESS}/`,
            path: path.posix.join(Constants.APP_DIR, "public/zh_CN/链滴笔记用户指南")
        });
        // TODO open file
    });
    document.getElementById("barBug").addEventListener("click", () => {
        remote.getCurrentWindow().webContents.openDevTools({mode: "bottom"});
    });
    document.getElementById("barSettings").addEventListener("click", () => {
        initSearch("settings");
    });
};


const initWindow = () => {
    // window action
    const currentWindow = remote.getCurrentWindow();
    if (process.platform === "darwin") {
        document.getElementById("drag").addEventListener("dblclick", () => {
            if (currentWindow.isMaximized()) {
                currentWindow.unmaximize();
            } else {
                currentWindow.maximize();
            }
        });
        return;
    }

    if (process.platform === "win32") {
        document.body.classList.add("body--win32");
    }

    currentWindow.on("blur", () => {
        document.body.classList.add("body--blur");
    });
    currentWindow.on("focus", () => {
        document.body.classList.remove("body--blur");
    });

    const maxBtnElement = document.getElementById("maxWindow");
    const restoreBtnElement = document.getElementById("restoreWindow");
    const minBtnElement = document.getElementById("minWindow");
    const closeBtnElement = document.getElementById("closeWindow");

    minBtnElement.addEventListener("click", () => {
        currentWindow.minimize();
    });
    minBtnElement.style.display = "block";

    maxBtnElement.addEventListener("click", () => {
        currentWindow.maximize();
    });

    restoreBtnElement.addEventListener("click", () => {
        currentWindow.unmaximize();
    });

    closeBtnElement.addEventListener("click", () => {
        currentWindow.close();
    });
    closeBtnElement.style.display = "block";

    const toggleMaxRestoreButtons = () => {
        if (currentWindow.isMaximized()) {
            restoreBtnElement.style.display = "block";
            maxBtnElement.style.display = "none";
        } else {
            restoreBtnElement.style.display = "none";
            maxBtnElement.style.display = "block";
        }
    };
    toggleMaxRestoreButtons();
    currentWindow.on("maximize", toggleMaxRestoreButtons);
    currentWindow.on("unmaximize", toggleMaxRestoreButtons);
};
