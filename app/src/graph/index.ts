import * as echarts from "echarts";
import * as path from "path";
import {i18n} from "../i18n";
import {escapeHtml} from "../util/escape";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {openFile} from "../editor/util";
import {showMessage} from "../util/message";
import {getAllModels} from "../layout/util";

export class Graph extends Model {
    public inputElement: HTMLInputElement;
    private graphElement: HTMLDivElement;
    private levelInputElement: HTMLInputElement;
    public chart: echarts.ECharts
    public url: string
    public path: string
    private nodes: Record<string, unknown>[]
    private links: Record<string, unknown>[]

    constructor(options: {
        tab: Tab
        url?: string
        path?: string
    }) {
        super({
            id: options.tab.id,
            callback() {
                if (options.url) {
                    this.send("treegraph", {
                        k: this.inputElement.value,
                        url: options.url,
                        path: options.path
                    });
                } else {
                    this.send("graph", {
                        k: this.inputElement.value
                    });
                }
            }
        });
        this.url = options.url;
        this.path = options.path;
        this.ws.onmessage = (event) => {
            const data = processMessage(event.data);
            if (data) {
                switch (data.cmd) {
                    case "graph":
                    case "treegraph":
                        this.onGraph(data.data);
                        break;
                    case "reload":
                        if (this.path) {
                            if (data.data.url === this.url && data.data.path === this.path) {
                                this.send("treegraph", {
                                    k: this.inputElement.value,
                                    url: options.url,
                                    path: options.path
                                });
                            }
                        } else {
                            this.send("graph", {
                                k: this.inputElement.value,
                            });
                        }
                        break;
                }
            }
        };

        options.tab.panelElement.classList.add("graph");
        this.graphElement = options.tab.panelElement.lastElementChild as HTMLDivElement;
        this.inputElement = options.tab.panelElement.firstElementChild.firstElementChild as HTMLInputElement;
        this.inputElement.placeholder = i18n[window.liandi.config.lang].search;
        this.inputElement.addEventListener("compositionend", () => {
            this.searchGraph();
        });
        this.inputElement.addEventListener("input", (event: InputEvent) => {
            if (event.isComposing) {
                return;
            }
            this.searchGraph();
        });
        if (this.url) {
            this.inputElement.insertAdjacentHTML("afterend", `<span class="graph__label">${i18n[window.liandi.config.lang].linkLevel}</span><input value='1' min='0' max='16' type='number' class='input graph__number'>`);
            this.levelInputElement = options.tab.panelElement.firstElementChild.lastElementChild as HTMLInputElement;
            this.levelInputElement.addEventListener("input", (event: InputEvent & { target: HTMLInputElement }) => {
                const value = parseInt(event.target.value, 10);
                if (value < 0 || value > 16) {
                    event.target.value = "1";
                    showMessage(i18n[window.liandi.config.lang].linkLevelTip);
                }
                this.searchGraph();
            });
        }
    }

    private searchGraph() {
        if (!this.path) {
            this.send("graph", {
                k: this.inputElement.value
            });
        } else {
            this.send("treegraph", {
                k: this.inputElement.value,
                url: this.url,
                path: this.path,
                depth: parseInt(this.levelInputElement.value, 10)
            });
        }
    }

    public hlNode(id: string) {
        this.nodes.forEach((item) => {
            if (item.name === id) {
                item.symbolSize = 30
            } else {
                item.symbolSize = undefined
            }
        })
        this.onGraph({nodes: this.nodes, links: this.links})
    }

    private onGraph(data: { nodes: Record<string, unknown>[], links: Record<string, unknown>[], url?: string, path?: string }) {
        if (!this.chart) {
            this.chart = echarts.init(this.graphElement);
            this.chart.on("dblclick", (params: IEchartsFormatter) => {
                if (params.dataType === "node") {
                    openFile(params.data.url, params.data.path, params.data.label.show ? "" : params.name);
                }
            });
            this.chart.on("click", (params: IEchartsFormatter) => {
                if (params.dataType === "node") {
                    getAllModels().editor.find((item) => {
                        if (item.url === params.data.url && item.path === params.data.path &&
                            !item.element.classList.contains("fn__none")) {
                            const vditorElement = item.vditore.vditor.ir.element;
                            vditorElement.querySelectorAll(".editor__blockref").forEach(item => {
                                item.classList.remove("editor__blockref");
                            });
                            const nodeElement = vditorElement.querySelector(`[data-node-id="${params.name}"]`) as HTMLElement;
                            if (nodeElement && nodeElement.getClientRects().length > 0) {
                                nodeElement.classList.add("editor__blockref");
                                vditorElement.scrollTop = nodeElement.offsetTop - vditorElement.clientHeight / 2;
                                this.hlNode(params.name)
                            }
                            return true;
                        }
                    });
                }
            });
        } else {
            this.chart.resize();
        }
        this.nodes = data.nodes
        this.links = data.links
        this.chart.setOption({
            legend: {
                data: [{
                    name: i18n[window.liandi.config.lang].rootBlock,
                    icon: "circle"
                }, {
                    name: i18n[window.liandi.config.lang].normalBlock,
                    icon: "circle"
                }],
                top: 20,
                right: 20,
                orient: "vertical",
                textStyle: {
                    padding: [2, 4, 2, 4],
                    color: "#d1d5da",
                    backgroundColor: "rgba(68, 77, 86, .68)",
                    borderRadius: 3,
                    lineHeight: 14,
                    fontSize: 12,
                },
                inactiveColor: "#959da5",
            },
            tooltip: {
                textStyle: {
                    color: "#d1d5da",
                },
                backgroundColor: "rgba(36, 41, 46, .86)",
                padding: [2, 4, 2, 4],
                formatter: (params: IEchartsFormatter) => {
                    if (params.dataType === "edge") {
                        return `<div style="font-size: 10px;line-height: 12px">${params.data.lineStyle.type === "dotted" ? i18n[window.liandi.config.lang].relativeRelation : i18n[window.liandi.config.lang].parentRelation}</div>`;
                    } else {
                        return `<div style="font-size: 12px;line-height: 14px; word-break: break-all;width: 220px;white-space: normal;">${params.data.category === 3 ? "This is a bug block, please go to https://github.com/88250/window.liandi/issues/new for feedback" : escapeHtml(params.data.content)}</div>
<div style="font-size: 10px;color:#959da5;line-height: 12px">${params.data.name}</div>`;
                    }
                },
            },
            series: [
                {
                    categories: [{
                        name: i18n[window.liandi.config.lang].rootBlock,
                        itemStyle: {
                            color: "#7c828b"
                        },
                    }, {
                        name: i18n[window.liandi.config.lang].normalBlock,
                        itemStyle: {
                            color: "#7c828b"
                        },
                    }, {
                        name: "Bug",
                        itemStyle: {
                            color: "#ea4aaa"
                        },
                    }],
                    draggable: true,
                    label: {
                        position: 'bottom',
                        padding: [2, 4, 2, 4],
                        color: "#d1d5da",
                        backgroundColor: "rgba(68, 77, 86, .68)",
                        fontSize: 10,
                        borderRadius: 3,
                        lineHeight: 12,
                        formatter: (params: IEchartsFormatter) => {
                            if (params.data.category === 0) {
                                return path.posix.basename(params.data.path);
                            } else {
                                return params.data.content.substr(0, 8);
                            }
                        },
                    },
                    force: {
                        repulsion: 100,
                        edgeLength: [30, 100],
                        // @ts-ignores
                        friction: 0.15
                    },
                    type: "graph",
                    layout: "force",
                    focusNodeAdjacency: true,
                    roam: true,
                    lineStyle: {
                        color: "source",
                        curveness: 0,
                        opacity: 0.28,
                    },
                    emphasis: {
                        lineStyle: {
                            color: '#f3a92f',
                            opacity: 0.38,
                        },
                        itemStyle: {
                            color: '#f3a92f',
                        }
                    },
                    edgeSymbol: ["none", "arrow"],
                    edgeSymbolSize: [0, 8],
                    data: this.nodes,
                    links: this.links,
                }
            ]
        });

    }
}
