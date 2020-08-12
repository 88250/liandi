import * as echarts from 'echarts';
import * as path from 'path';

export class Graph {
    public element: HTMLDivElement;
    private chart: echarts.ECharts

    constructor() {
        this.element = document.getElementById("graph") as HTMLDivElement
    }

    show(liandi: ILiandi) {
        this.element.classList.remove("fn__none")
        // TODO remove true
        liandi.ws.send("graph", {}, true);
    }

    hide() {
        this.element.classList.add("fn__none")
    }

    resize() {
        if (!this.element.classList.contains("fn__none")) {
            this.chart.resize();
        }
    }

    onGraph(liandi: ILiandi, data: { nodes: string[], links: Record<string, unknown>[] }) {
        this.chart = echarts.init(liandi.graph.element)
        this.chart.setOption({
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                legend: {},
                tooltip: {
                    formatter: (params: IEchartsFormatter) => {

                        if (params.dataType === "edge") {
                            return `<div style="font-size: 12px">${params.data.lineStyle.type === "dotted" ? "关联关系" : "父子关系"}</div>`
                        } else {
                            let text = params.data.content.substr(1, 24)
                            if (params.data.content.length > 24) {
                                text += '...'
                            }
                            if (params.data.category === 0) {
                                return `<div style="font-size: 14px">${path.posix.basename(params.data.path)}</div>
<div style="font-size: 12px;color: #ccc">${params.data.name}</div>
<div style="font-size: 12px">${text}</div>`
                            } else {
                                return `<div style="font-size: 12px;color: #ccc">${params.data.name}</div>
<div style="font-size: 12px">${text}</div>`
                            }
                        }
                    },
                },
                series: [
                    {
                        categories: [{
                            name: "根块",
                            symbol: "circle",
                            itemStyle: {
                                color: "#d23f31"
                            },
                        }, {
                            name: "子块",
                            symbol: "circle",
                            itemStyle: {
                                color: "#3b3e43"
                            },
                        }],
                        draggable: true,
                        label: {
                            position: 'right',
                            color: '#4285f4',
                            formatter: (params: IEchartsFormatter) => {
                                if (params.data.category === 0) {
                                    return path.posix.basename(params.data.path);
                                }
                            },
                        },
                        symbolSize: (value: number, params: IEchartsFormatter) => {
                            if (params.data.category === 0) {
                                return 20
                            } else {
                                return 10
                            }
                        },
                        force: {
                            repulsion: 100,
                            edgeLength: [30, 100],
                            layoutAnimation: false,
                        },
                        type: 'graph',
                        layout: 'force',
                        focusNodeAdjacency: true,
                        roam: true,
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        },
                        lineStyle: {
                            color: 'source',
                            curveness: 0.1
                        },
                        emphasis: {
                            lineStyle: {
                                width: 3
                            }
                        },
                        edgeSymbol: ['none', 'arrow'],
                        edgeSymbolSize: [0, 6],
                        data: data.nodes,
                        links: data.links,
                    }
                ]
            }
        );

        this.chart.on('click', (params: { dataType: string }) => {
            if (params.dataType === "node") {
                console.log(params);

            }
        });
    }
}
