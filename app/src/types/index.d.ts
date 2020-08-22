type TLayout = "normal" | "top" | "bottom" | "left" | "right" | "center"
type TDirection = "lr" | "tb"
type TTheme = "light" | "dark"

interface Window {
    liandi: ILiandi
}

interface ILiandi {
    layout: import("../layout").Layout,
    topLayout: import("../layout").Layout,
    leftLayout: import("../layout").Layout,
    centerLayout: import("../layout").Layout,
    rightLayout: import("../layout").Layout,
    bottomLayout: import("../layout").Layout,
    rightLayoutWidth?: number,
    bottomLayoutHeight?: number
    find?: import("../search/Find").Find,
    config?: IConfig;
    ws: import("../layout/Model").Model,
    // resizeList?: any[]
    menus: import("../menus").Menus
    current?: {
        box?: IBox
        path?: string
    };
}

interface IObject {
    [key: string]: string;
}

declare interface II18n {
    en_US: IObject;
    zh_CN: IObject;
    ja_JP?: IObject;
    ko_KR?: IObject;
}

declare interface ILayoutOptions {
    direction?: TDirection;
    size?: string
    resize?: TDirection
    type?: TLayout
    element?: HTMLElement
}

declare interface ITab {
    title?: string
    panel?: string
    callback?: (tab: import("../layout/Tab").Tab) => void
}

declare interface IMD {
    autoSpace: boolean;
    chinesePunct: boolean;
    fixTermTypo: boolean;
    inlineMathAllowDigitAfterOpenMarker: boolean;
    mathEngine: "KaTeX" | "MathJax";
    hideToolbar: boolean;
    toc: boolean;
    footnotes: boolean;
    outline: boolean;
    paragraphBeginningSpace: boolean;
    mark: boolean;
}

declare interface IConfig {
    boxes: IBox[]
    lang: keyof II18n
    theme: TTheme,
    markdown: IMD,
    image: { autoFetch: boolean }
}

declare interface IFile {
    path: string;
    name: string;
    isdir: boolean;
}

declare interface IBlock {
    url: string;
    path: string;
    id: string;
    type?: string;
    content: string;
    def?: IBlock;
    refs?: IBlock[];
}

declare interface IAllBacklinks {
    def: IBlock
    refs: IBlock[]
}

declare interface IBox {
    auth?: string;
    password?: string;
    path?: string;
    url: string;
    user?: string;
}

declare interface IEchartsFormatter {
    dataType: string
    data: {
        name: string
        category: number
        path: string
        content: string
        lineStyle: {
            type: string
        }
        label: {
            show: boolean
        }
        url: string
    }
}

declare interface IMenuData {
    target?: HTMLElement
    path?: string
    url?: string
    name?: string
    model?: import("../layout/Model").Model
}

declare interface IModels {
    editor: import("../editor").Editor [],
    backlinks: import("../backlinks").Backlinks [],
    graph: import("../graph").Graph[],
    files: import("../files").Files[]
}
