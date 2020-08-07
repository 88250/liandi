import * as path from 'path';
import {hasTopClosestByTag} from "../../vditore/src/ts/util/hasClosest";
import {escapeHtml} from "../util/compatibility";
import {destroyDialog} from "../util/dialog";

export class Navigation {
    public element: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
        let timeoutId: number
        this.element.addEventListener('click', (event) => {
            let target = event.target as HTMLElement
            const ulElement = hasTopClosestByTag(target, "UL")
            if (ulElement) {
                const dir = JSON.parse(decodeURIComponent(ulElement.getAttribute("data-dir")))
                if (event.detail === 1) {
                    timeoutId = window.setTimeout(() => {
                        while (target && !target.isEqualNode(ulElement)) {
                            if (target.classList.contains('item__arrow')) {
                                this.getLeaf(target.parentElement, dir)
                                this.setCurrent(target.parentElement)
                                event.preventDefault()
                                event.stopPropagation()
                                break
                            }

                            if (target.getAttribute("data-type") === "navigation-file") {
                                this.setCurrent(target)
                                liandi.editors.save(liandi)
                                const path = decodeURIComponent(target.getAttribute('data-path'))
                                liandi.current = {
                                    dir, path
                                }
                                liandi.ws.send('get', {
                                    url: dir.url,
                                    path,
                                })
                                liandi.backlinks.getBacklinks(liandi);
                                event.preventDefault()
                                event.stopPropagation()
                                break
                            }

                            if (target.tagName === 'LI') {
                                this.setCurrent(target)
                                event.preventDefault()
                                event.stopPropagation()
                                break
                            }
                            target = target.parentElement
                        }
                    }, 300)
                } else if (event.detail === 2) {
                    while (target && !target.isEqualNode(ulElement)) {
                        if (target.tagName === "LI" && target.getAttribute("data-type") !== "navigation-file") {
                            this.getLeaf(target, dir)
                            this.setCurrent(target)
                            event.preventDefault()
                            event.stopPropagation()
                            break
                        }

                        target = target.parentElement
                    }
                    clearTimeout(timeoutId)
                }
            }
        })
    }

    public getLeaf(liElement: HTMLElement, dir: IDir) {
        const files = JSON.parse(liElement.getAttribute('data-files'))
        if (liElement.firstElementChild.classList.contains('item__arrow--open')) {
            liElement.firstElementChild.classList.remove('item__arrow--open')
            liElement.nextElementSibling.remove();
            return
        }

        liElement.firstElementChild.classList.add('item__arrow--open')

        let fileHTML = ''
        files.forEach((item: IFile) => {
            const style = ` style="padding-left: ${(item.path.split('/').length - (item.isdir ? 2 : 1)) * 13 + (item.isdir ? 0 : 18)}px"`
            if (item.isdir) {
                fileHTML += `<li data-name="${encodeURIComponent(item.name)}" data-path="${encodeURIComponent(item.path)}" data-type="navigation-folder" class="fn__a fn__flex"${style}>
<svg class="item__arrow fn__hidden" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconRight"></use></svg>
<span class="item__name">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#${dir.path === '' ? 'iconCloud' : 'iconFolder'}"></use></svg>
  <span class="fn__ellipsis">${escapeHtml(item.name)}</span>
</span>
</li>`
                window.liandi.liandi.ws.send('ls', {
                    url: dir.url,
                    path: item.path,
                }, true)
            } else {
                fileHTML += `<li${style}  data-name="${encodeURIComponent(item.name)}" data-type="navigation-file" class="item__name fn__a" data-path="${encodeURIComponent(
                    item.path)}">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconMD"></use></svg>
<span class="fn__ellipsis">${escapeHtml(item.name)}</span></li>`
            }
        })
        liElement.insertAdjacentHTML('afterend',
            `<ul>${fileHTML}</ul>`)
    }

    private setCurrent(target: HTMLElement) {
        this.element.querySelectorAll('li').forEach((liItem) => {
            liItem.classList.remove('item--current')
        })
        target.classList.add('item--current')
    }

    public onRename(liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string, url: string }) {
        const fileItemElement = this.element.querySelector(`ul[data-url="${encodeURIComponent(data.url)}"] li[data-path="${encodeURIComponent(data.oldPath)}"]`);
        fileItemElement.setAttribute('data-path', encodeURIComponent(data.newPath));
        fileItemElement.setAttribute('data-name', encodeURIComponent(data.newName));
        fileItemElement.querySelector(".fn__ellipsis").innerHTML = escapeHtml(data.newName);
        if (liandi.current.dir && liandi.current.dir.url === data.url && liandi.current.path === data.oldPath) {
            if (!data.newPath.endsWith('/')) {
                liandi.editors.currentEditor.inputElement.value = data.newName.replace('.md', '');
                liandi.current.path = data.newPath;
            }
        }
        destroyDialog()
    }

    public onLs(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        const liElement = this.element.querySelector(`ul[data-url="${encodeURIComponent(data.url)}"] li[data-path="${encodeURIComponent(data.path)}"]`);
        if (data.files.length > 0 && liElement) {
            liElement.setAttribute('data-files', JSON.stringify(data.files));
            liElement.firstElementChild.classList.remove("fn__hidden")
        }
    }

    public onMount(liandi: ILiandi, data: { dir: IDir }) {
        let html = `<ul data-url="${encodeURIComponent(data.dir.url)}" data-dir="${encodeURIComponent(JSON.stringify(data.dir))}">
<li class="fn__flex fn__a" data-type="navigation-root" data-path="%2F">
<svg class="item__arrow fn__hidden" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconRight"></use></svg>
<span class="item__name">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#${data.dir.path === '' ? 'iconCloud' : 'iconFolder'}"></use></svg>
  <span class="fn__ellipsis">${path.basename(escapeHtml(data.dir.url))}</span>
</span>
</li></ul>`
        this.element.insertAdjacentHTML('beforeend', html);

        liandi.ws.send('ls', {
            url: data.dir.url,
            path: '/',
        }, true)
    }

    public show() {
        this.element.classList.remove('fn__none');
        document.getElementById('resize').classList.remove('fn__none');
    }

    public hide() {
        this.element.classList.add('fn__none');
        document.getElementById('resize').classList.add('fn__none');
    }
}
