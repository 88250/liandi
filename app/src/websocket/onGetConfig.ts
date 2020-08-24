import {Wnd} from "../layout/wnd";
import {i18n} from "../i18n";
import {initSearch} from "../search";
import {remote} from "electron";
import {addInitWnd, getAllModels} from "../layout/util";
import {Constants} from "../constants";
import * as path from "path";
import {Graph} from "../graph";
import {Tab} from "../layout/Tab";
import {Files} from "../files";

export const onGetConfig = (data: IConfig) => {
    window.liandi.config = data;
    document.title = i18n[window.liandi.config.lang].slogan;
    initBar();
    initWindow();
    addInitWnd();
};

const initBar = () => {
    document.querySelector(".toolbar").innerHTML = `<div id="barNavigation" aria-label="${i18n[window.liandi.config.lang].fileTree}" class="item fn__a">
            <svg>
                <use xlink:href="#iconFiles"></use>
            </svg>
        </div>
        <div id="barGraph" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].graphView}">
            <svg>
                <use xlink:href="#iconGraph"></use>
            </svg>
        </div>
        <div class="fn__flex-1" id="drag"></div>
        <a href="https://hacpai.com/sponsor" class="item ft__pink" aria-label="${i18n[window.liandi.config.lang].sponsor}">
            <svg>
                <use xlink:href="#iconFavorite"></use>
            </svg>
        </a>
        <div id="barHelp" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].help}">
            <svg>
                <use xlink:href="#iconHelp"></use>
            </svg>
        </div>
        <div id="barBug" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].debug}">
            <svg>
                <use xlink:href="#iconBug"></use>
            </svg>
        </div>
        <div id="barSettings" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].config}">
            <svg>
                <use xlink:href="#iconSettings"></use>
            </svg>
        </div>`;
    document.getElementById("barNavigation").addEventListener("click", () => {
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconFiles"></use></svg> ${i18n[window.liandi.config.lang].fileTree}`,
            callback(tab: Tab) {
                if (window.liandi.leftLayout.element.clientWidth < 7) {
                    window.liandi.centerLayout.element.style.width = (window.liandi.centerLayout.element.clientWidth - 200) + "px";
                    window.liandi.leftLayout.element.style.width = "206px";
                }
                tab.addModel(new Files(tab));
            }
        });
        (window.liandi.leftLayout.children[0] as Wnd).addTab(tab);
    });

    document.getElementById("barGraph").addEventListener("click", function () {
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg> ${i18n[window.liandi.config.lang].graphView}`,
            panel: '<div class="graph__input"><input class="input"></div><div class="fn__flex-1"></div>',
            callback(tab: Tab) {
                if (window.liandi.rightLayout.element.clientWidth < 7) {
                    window.liandi.centerLayout.element.style.width = (window.liandi.centerLayout.element.clientWidth - window.innerWidth / 3) + "px";
                }
                tab.addModel(new Graph({tab}));
            }
        });
        (window.liandi.rightLayout.children[0] as Wnd).addTab(tab);
    });
    document.getElementById("barHelp").addEventListener("click", function () {
        if (getAllModels().files.length === 0) {
            document.getElementById("barNavigation").dispatchEvent(new CustomEvent("click"));
        }
        setTimeout(() => {
            getAllModels().files[0].send("mount", {
                url: `${Constants.WEBDAV_ADDRESS}/`,
                path: path.posix.join(Constants.APP_DIR, "public/zh_CN/链滴笔记用户指南"),
                pushMode: 0,
                callback: Constants.CB_MOUNT_HELP
            });
        }, 200)
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
