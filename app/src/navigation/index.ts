import * as path from 'path';
import {hasTopClosestByTag} from "../../vditore/src/ts/util/hasClosest";

export class Navigation {
    public element: HTMLElement;

    constructor(liandi: ILiandi) {
        this.element = document.getElementById('navigation');
        let timeoutId: number
        this.element.addEventListener('click', (event) => {
            let target = event.target as HTMLElement
            const ulElement = hasTopClosestByTag(target, "UL")
            if (ulElement) {
                liandi.current.dir = JSON.parse(decodeURIComponent(ulElement.getAttribute("data-dir")))
                if (event.detail === 1) {
                    timeoutId = window.setTimeout(() => {
                        while (target && !target.isEqualNode(ulElement)) {
                            if (target.classList.contains('item__arrow')) {
                                this.getLeaf(target, liandi.current.dir)
                                this.setCurrent(target.parentElement)
                                event.preventDefault()
                                event.stopPropagation()
                                break
                            }

                            if (target.classList.contains('item__name--md')) {
                                this.setCurrent(target)
                                liandi.editors.save(liandi)
                                const path = decodeURIComponent(target.getAttribute('data-path'))
                                liandi.ws.send('get', {
                                    url: liandi.current.dir.url,
                                    path,
                                })
                                liandi.current.path = path
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
                        if (target.classList.contains('fn__flex')) {
                            this.getLeaf(target.firstElementChild as HTMLElement, liandi.current.dir)
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

    private getLeaf(target: HTMLElement, dir: IDir) {
        const filesString = target.getAttribute('data-files')
        if (!filesString) {
            return
        }
        if (target.classList.contains('item__arrow--open')) {
            target.classList.remove('item__arrow--open')
            target.parentElement.nextElementSibling.classList.add("fn__none")
            return
        }

        target.classList.add('item__arrow--open')

        const files = JSON.parse(filesString)
        let fileHTML = ''
        files.forEach((item: IFile) => {
            const style = ` style="padding-left: ${(item.path.split('/').length -
                (item.isdir ? 2 : 1)) * 13}px"`
            if (item.isdir) {
                fileHTML += `<li data-type="navigation-folder" class="fn__a fn__flex"${style}>
<svg class="item__arrow" path="${item.path}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
<span class="item__name" path="${item.path}">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#${dir.path !== '' ? 'iconCloud' : 'iconFolder'}"></use></svg>
  <span class="fn__ellipsis">${item.name}</span>
</span>
</li>`
                window.liandi.liandi.ws.send('ls', {
                    url: dir.url,
                    path: item.path,
                }, true)
            } else {
                fileHTML += `<li${style} data-type="navigation-file" class="item__name--md item__name fn__a" data-path="${encodeURIComponent(
                    item.path)}">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconMD"></use></svg>
<span class="fn__ellipsis">${item.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></li>`
            }
        })
        target.parentElement.insertAdjacentHTML('afterend',
            `<ul>${fileHTML}</ul>`)
    }

    private setCurrent(target: HTMLElement) {
        this.element.querySelectorAll('li').forEach((liItem) => {
            liItem.classList.remove('item--current')
        })
        target.classList.add('item--current')
    }

    public onRename(liandi: ILiandi, data: { newPath: string, oldPath: string, newName: string }) {
        const fileItemElement = this.element.querySelector(`.file[path="${encodeURIComponent(data.oldPath)}"]`);
        fileItemElement.setAttribute('path', encodeURIComponent(data.newPath));
        fileItemElement.setAttribute('name', encodeURIComponent(data.newName));

        if (fileItemElement.getAttribute('current') === 'true') {
            liandi.current.path = data.newPath;

            if (!data.newPath.endsWith('/')) {
                (document.querySelector('.editors__input') as HTMLInputElement).value = data.newName.replace('.md', '');
            }
        }
    }

    public onLs(liandi: ILiandi, data: { files: IFile[], url: string, path: string }) {
        if (data.files.length > 0) {
            const arrowElement = this.element.querySelector(`.item__arrow[path="${data.path}"]`);
            arrowElement.setAttribute('data-files', JSON.stringify(data.files));
            arrowElement.classList.remove("fn__hidden")
        }
    }

    public onMount(liandi: ILiandi, data: { dir: IDir }) {
        let html = `<ul data-url="${data.dir.url}" data-dir="${encodeURIComponent(JSON.stringify(data.dir))}">
<li class="fn__flex fn__a" data-type="navigation-root">
<svg class="item__arrow fn__hidden" path="/" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#iconRight"></use></svg>
<span class="item__name" path="/">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><use xlink:href="#${data.dir.path !== '' ? 'iconCloud' : 'iconFolder'}"></use></svg>
  <span class="fn__ellipsis">${path.basename(data.dir.url)}</span>
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
