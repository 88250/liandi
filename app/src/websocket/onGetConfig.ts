import {Layout} from "../layout";
import {Wnd} from "../layout/wnd";
import {i18n} from "../i18n";
import {initSearch} from "../search";
import {remote} from "electron";
import {WebSocketUtil} from "./index";
import {File} from "../file";
import {addCenterWnd} from "../layout/util";
import {Constants} from "../constants";
import * as path from "path";

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
    document.getElementById("barNavigation").addEventListener("click", function () {

        const leftLayout = (window.liandi.layout.children[1] as Layout).children[0] as Layout
        leftLayout.addWnd(new Wnd({
            title: `<svg><use xlink:href="#iconFolder"></use></svg> ${i18n[window.liandi.config.lang].fileTree}`,
            resize: leftLayout.children.length === 0 ? undefined : 'tb',
            callback: function (wnd: Wnd) {
                if (leftLayout.element.clientWidth < 7) {
                    leftLayout.parent.children[1].element.style.width = (leftLayout.parent.children[1].element.clientWidth - 200) + 'px'
                    leftLayout.element.style.width = "206px";
                }
                const currentTab = wnd.children.children[0]
                currentTab.model = new File(currentTab);
                currentTab.ws = new WebSocketUtil(currentTab,  ()=> {
                    window.liandi.config.boxes.map((item: IDir) => {
                        currentTab.model.onMount({dir: item});
                    });
                });

            }
        }));
        window.dispatchEvent(new CustomEvent("resize"));
    });
    // TODO
    // document.getElementById('barGraph').addEventListener('click', function () {
    //     if (this.classList.contains("item--current")) {
    //         liandi.graph.hide(liandi);
    //     } else {
    //         liandi.graph.show(liandi)
    //     }
    //     window.dispatchEvent(new CustomEvent('resize'));
    // });
    // document.getElementById('barBacklinks').addEventListener('click', function () {
    //     if (this.classList.contains('item--current')) {
    //         liandi.backlinks.hide(liandi);
    //     } else {
    //         liandi.backlinks.show(liandi);
    //     }
    //     window.dispatchEvent(new CustomEvent('resize'));
    // });
    document.getElementById('barHelp').addEventListener('click', function () {
        window.liandi.ws.send('mount', {
            url: `${Constants.WEBDAV_ADDRESS}/`,
            path: path.posix.join(Constants.APP_DIR, 'public/zh_CN/链滴笔记用户指南')
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
