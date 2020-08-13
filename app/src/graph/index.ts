import * as echarts from 'echarts';
import * as path from 'path';

export class Graph {
    public element: HTMLDivElement;
    private chart: echarts.ECharts

    constructor() {
        this.element = document.getElementById("graph") as HTMLDivElement
    }

    show(liandi: ILiandi) {
        this.element.classList.remove('fn__none');
        liandi.ws.send("graph", {});
        document.getElementById('resize3').classList.remove('fn__none');
        document.getElementById('barGraph').classList.add("item--current");
        liandi.backlinks.hide(liandi);
    }

    hide() {
        this.element.classList.add('fn__none');
        document.getElementById('resize3').classList.add('fn__none');
        document.getElementById('barGraph').classList.remove("item--current");
    }

    resize() {
        if (this.chart && !this.element.classList.contains("fn__none")) {
            this.chart.resize();
        }
    }

    onGraph(liandi: ILiandi, data: { nodes: string[], links: Record<string, unknown>[] }) {
        if (!this.chart) {
            this.chart = echarts.init(this.element)
        } else {
            this.resize()
        }
        this.chart.setOption({
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                legend: {
                    data: [{
                        name: "根块",
                        icon: "circle"
                    }, {
                        name: "普通块",
                        icon: "circle"
                    }, {
                        name: "关联块",
                        icon: "circle"
                    }],
                    top: 20,
                    right: 20,
                    orient: 'vertical',
                    textStyle: {
                        color: 'auto'
                    }
                },
                tooltip: {
                    formatter: (params: IEchartsFormatter) => {
                        if (params.dataType === "edge") {
                            return `<div style="font-size: 12px">${params.data.lineStyle.type === "dotted" ? "关联关系" : "父子关系"}</div>`
                        } else {
                            let text = params.data.content.substr(0, 16)
                            if (params.data.content.length > 16) {
                                text += '...'
                            }
                            return `<div style="font-size: 12px">${text}</div>
<div style="font-size: 12px;color: #ccc">${params.data.name}</div>`
                        }
                    },
                },
                series: [
                    {
                        categories: [{
                            name: "根块",
                            itemStyle: {
                                color: "#161719"
                            },
                        }, {
                            name: "普通块",
                            itemStyle: {
                                 color: "#7c828b"
                            },
                        }, {
                            name: "关联块",
                            itemStyle: {
                                 color: "#d23f31"
                            },
                        }],
                        draggable: true,
                        label: {
                            position: 'right',
                            color: 'auto',
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
                            // @ts-ignores
                            friction: 0.15
                        },
                        type: 'graph',
                        layout: 'force',
                        focusNodeAdjacency: true,
                        roam: true,
                        itemStyle: {
                            borderColor: 'rgba(255, 255, 255, 0.68)',
                            borderWidth: 1,
                        },
                        lineStyle: {
                            color: 'source',
                            curveness: 0,
                        },
                        emphasis: {
                            lineStyle: {
                                width: 3
                            },
                            itemStyle: {
                                borderColor: '#fff',
                            },
                        },
                        edgeSymbol: ['none', 'arrow'],
                        edgeSymbolSize: [0, 8],
                        data: data.nodes,
                        links: data.links,
                    }
                ]
            }
        );

        this.chart.on('click', (params: IEchartsFormatter) => {
            if (params.dataType === "node" && params.data.label) {
                liandi.editors.save(liandi)
                liandi.current = {
                    dir: {url: params.data.url},
                    path: params.data.path
                }
                liandi.ws.send('get', {
                    url: params.data.url,
                    path: params.data.path,
                })
            }
        });
    }
}
