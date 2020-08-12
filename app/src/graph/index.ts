import * as echarts from 'echarts';

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
                legend: {
                    data: ['name1', 'name2', 'name3']
                },
                tooltip: {},
                series: [
                    {
                        categories: [{name: "name1"}, {name: "name2"}, {name: "name3"}],
                        draggable: true,
                        type: 'graph',
                        layout: 'circular',
                        focusNodeAdjacency: true,
                        symbolSize: 15,
                        roam: true,
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        },
                        label: {
                            position: 'right',
                            formatter: '{b}'
                        },
                        lineStyle: {
                            color: 'source',
                            curveness: 0.3
                        },
                        emphasis: {
                            lineStyle: {
                                width: 3
                            }
                        },
                        edgeSymbol: ['circle', 'arrow'],
                        edgeSymbolSize: [4, 10],
                        edgeLabel: {
                            fontSize: 14
                        },
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
