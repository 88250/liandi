export const lauguage = {
    genHTML: () => {
        return `<select class="input">
    <option value="en_US" ${window.liandi.config.lang === "en_US" ? "selected" : ""}>English</option>
    <option value="zh_CN" ${window.liandi.config.lang === "zh_CN" ? "selected" : ""}>简体中文</option>
</select>`;
    },
    bindEvent: (element: HTMLElement) => {
        element.querySelector("select").addEventListener("change" , (event) => {
            window.liandi.ws.send("setlang", {
                lang: (event.target as HTMLSelectElement).value
            });
        });
    }
};
