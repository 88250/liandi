export const lauguage = {
    genHTML: (liandi: ILiandi) => {
        return `<select class="input">
    <option value="en_US" ${liandi.config.lang === 'en_US' ? 'selected' : ''}>English</option>
    <option value="zh_CN" ${liandi.config.lang === 'zh_CN' ? 'selected' : ''}>简体中文</option>
</select>`
    },
    bindEvent: (liandi: ILiandi, element: HTMLElement) => {
        element.querySelector('select').addEventListener('change' , (event) => {
            console.log(event)
            liandi.ws.send('setlang', {
                lang: (event.target as HTMLSelectElement).value
            })
        })
    },
    onSetlang: () => {
        window.location.reload()
    }
}
