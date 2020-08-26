import {i18n} from "../i18n";
import {destroyDialog, dialog} from "../util/dialog";
import {lauguage} from "../config/language";
import {about} from "../config/about";
import {theme} from "../config/theme";
import {initConfigSearch} from "../config/search";
import {markdown} from "../config/markdown";
import {image} from "../config/image";
import {escapeHtml} from "../util/escape";
import {getIconByType, openFile} from "../editor/util";

export const initSearch = (type = "search") => {
    const liandi = window.liandi;
    dialog({
        content: `<tab-panel>
  <ul slot="tab" class="tab fn__flex">
    <li data-name="search" class="${type === "search" ? "tab--current " : ""}fn__pointer">${i18n[liandi.config.lang].search}</li>
    <li data-name="config" class="${type !== "search" ? "tab--current " : ""}fn__pointer">${i18n[liandi.config.lang].config}</li>
    <li class="fn__flex-1"></li>
  </ul>
  <div data-name="search"${type === "search" ? ' slot="panel"' : ""}>
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <div class="list--signal" style="height: 403px"></div>
  </div>
  <div data-name="config"${type !== "search" ? ' slot="panel"' : ""}>
    <div class="fn__hr"></div>
    <input class="input">
    <div class="fn__hr"></div>
    <tab-panel type="vertical">
      <ul slot="tab" class="tab tab--vertical">
        <li data-name="markdown" class="tab--current fn__pointer">Markdown</li>
        <li data-name="image" class="fn__pointer">${i18n[liandi.config.lang].image}</li>
        <li data-name="theme" class="fn__pointer">${i18n[liandi.config.lang].theme}</li>
        <li data-name="language" class="fn__pointer">${i18n[liandi.config.lang].language}</li>
        <li data-name="about" class="fn__pointer">${i18n[liandi.config.lang].about}</li>
      </ul>
      <div class="tab__panel" data-name="markdown" slot="panel">${markdown.genHTML()}</div>
      <div class="tab__panel" data-name="image">${image.genHTML()}</div>
      <div class="tab__panel" data-name="theme">${theme.genHTML()}</div>
      <div class="tab__panel" data-name="language">${lauguage.genHTML()}</div>
      <div class="tab__panel" data-name="about">${about.genHTML()}</div>
    </tab-panel>
  </div>
</tab-panel>`,
        width: Math.max(window.innerWidth - 520, 600),
        height: 520,
        destroyDialogCallback: () => {
            // liandi.editors.focus();
        }
    });

    const dialogElement = document.querySelector("#dialog");
    const inputElement = dialogElement.querySelector(".input") as HTMLInputElement;
    inputElement.focus();

    inputElement.addEventListener("compositionend", () => {
        liandi.ws.send("search", {
            k: inputElement.value
        });
    });
    inputElement.addEventListener("input", (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }

        liandi.ws.send("search", {
            k: inputElement.value
        });
    });
    inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.isComposing) {
            return;
        }
        if (event.key === "Escape") {
            destroyDialog(() => {
                // liandi.editors.focus();
            });
            event.preventDefault();
        }
        let currentList: HTMLElement = dialogElement.querySelector('div[data-name="search"] .list__item--current');

        if (event.code === "ArrowDown") {
            if (currentList.nextElementSibling) {
                currentList.classList.remove("list__item--current");
                currentList = currentList.nextElementSibling as HTMLElement;
                currentList.classList.add("list__item--current");
                if (currentList.parentElement.scrollTop + 478 < currentList.offsetTop) {
                    currentList.parentElement.scrollTop = currentList.offsetTop - 478;
                }
            }
            event.preventDefault();
        } else if (event.code === "ArrowUp") {
            if (currentList.previousElementSibling) {
                currentList.classList.remove("list__item--current");
                currentList = currentList.previousElementSibling as HTMLElement;
                currentList.classList.add("list__item--current");
                if (currentList.parentElement.scrollTop > currentList.offsetTop - 107) {
                    currentList.parentElement.scrollTop = currentList.offsetTop - 107;
                }
            }
            event.preventDefault();
        } else if (event.code === "Enter") {
            quickOpenFile(dialogElement);
            event.preventDefault();
        }
    });

    const searchPanelElement = dialogElement.querySelector('div[data-name="search"]');
    searchPanelElement.addEventListener("dblclick", (event) => {
        let target = event.target as HTMLElement;
        while (target && !target.parentElement.isEqualNode(searchPanelElement)) {
            if (target.classList.contains("list__item")) {
                dialogElement.querySelector(".list__item--current").classList.remove("list__item--current");
                target.classList.add("list__item--current");
                quickOpenFile(dialogElement);
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    }, false);

    initConfigSearch(dialogElement.querySelector('div[data-name="config"]'));
    about.bindEvent(dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="about"]'));
    lauguage.bindEvent(dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="language"]'));
    theme.bindEvent(dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="theme"]'));
    markdown.bindEvent(dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="markdown"]'));
    image.bindEvent(dialogElement.querySelector('div[data-name="config"] .tab__panel[data-name="image"]'));
};

export const quickOpenFile = (dialogElement: Element) => {
    const currentList: HTMLElement = dialogElement.querySelector('div[data-name="search"] .list__item--current');
    openFile(JSON.parse(decodeURIComponent(currentList.getAttribute("data-url"))),
        decodeURIComponent(currentList.getAttribute("data-path")), currentList.getAttribute("data-id"));
    destroyDialog();
};

export const onSearch = (data: IBlock[]) => {
    let resultHTML = "";
    data.forEach((item, index) => {
        resultHTML += `<div class="list__item fn__flex${index === 0 ? " list__item--current" : ""}" data-url="${encodeURIComponent(JSON.stringify(item.url))}" data-path="${encodeURIComponent(item.path)}" data-id="${item.id}">
<svg class="fn__flex-shrink0"><use xlink:href="#${getIconByType(item.type)}"></use></svg><span class="fn__flex-1 fn__ellipsis">${escapeHtml(item.content).replace("&lt;mark", "<mark").replace("&lt;/mark", "</mark")}</span>
<span class="fn__space"></span>
<span class="ft__smaller ft__secondary">${escapeHtml(item.path)}</span>
</div>`;
    });

    const panelElement = document.querySelector('#dialog div[data-name="search"]');
    panelElement.querySelector(".list--signal").innerHTML = resultHTML;
};
