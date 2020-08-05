import {initGlobalKeyPress} from '../hotkey';
import { remote, clipboard} from 'electron';
import {i18n} from '../i18n';

// TODO remove
export class EditorWebview {
    private isInitMenu: boolean;
    private vditor: any;

    constructor() {
        this.isInitMenu = false;
        initGlobalKeyPress(this);
    }

    private initMenu(lang: keyof II18n) {
        if (this.isInitMenu) {
            return;
        }

        const menu = new remote.Menu();
        menu.append(new remote.MenuItem({
            label: i18n[lang].cut,
            id: 'cut',
            role: 'cut'
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].copy,
            id: 'copy',
            role: 'copy',
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].copyAsPlainText,
            id: 'copyAsPlainText',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
                clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ''));
            }
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].paste,
            id: 'paste',
            role: 'paste',
        }));
        menu.append(new remote.MenuItem({
            label: i18n[lang].pasteAsPlainText,
            id: 'pasteAsPlainText',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => {
                this.vditor.insertValue(clipboard.readText());
            }
        }));

        window.addEventListener('contextmenu', event => {
            let target = event.target as HTMLElement;
            while (target && !target.parentElement.isEqualNode(document.querySelector('body'))) {
                if (target.tagName === 'PRE') {
                    menu.getMenuItemById('cut').enabled = menu.getMenuItemById('copy').enabled = this.vditor.getSelection() !== '';
                    menu.getMenuItemById('pasteAsPlainText').enabled = clipboard.readText() !== '';
                    menu.popup();
                    event.preventDefault();
                    return false;
                }
                target = target.parentElement;
            }
        });

        this.isInitMenu = true;
    }

    private isCtrl(event: KeyboardEvent) {
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            // mac
            if (event.metaKey && !event.ctrlKey) {
                return true;
            }
            return false;
        } else {
            if (!event.metaKey && event.ctrlKey) {
                return true;
            }
            return false;
        }
    }

    private hotkey(event: KeyboardEvent) {
        if (this.isCtrl(event) && event.key.toLowerCase() === 'v' && !event.altKey && event.shiftKey) {
            const range = getSelection().getRangeAt(0);
            range.extractContents();
            this.vditor.insertValue(clipboard.readText());
            event.preventDefault();
        }

        if (this.isCtrl(event) && event.key.toLowerCase() === 'c' && !event.altKey && event.shiftKey) {
            clipboard.writeText(getSelection().getRangeAt(0).toString().replace(/​/g, ''));
            event.preventDefault();
        }
    }
}
