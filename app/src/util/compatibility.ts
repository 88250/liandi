// 区别 mac 上的 ctrl 和 meta, 暂时没用到
export const isCtrl = (event: KeyboardEvent) => {
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
};

export const escapeHtml = (html: string) => {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}
