import {addScript} from "../../vditore/src/ts/util/addScript";
import {Constants} from "../constants";
import * as path from "path";

declare const echarts: {
    init(element: HTMLElement): IEChart;
};

export class Graph {
    public element: HTMLElement;

    constructor() {
        this.element = document.getElementById("graph")
    }

    onGraph(liandi: ILiandi, data: any) {
        addScript(path.posix.join(Constants.APP_DIR, `vditore/dist/js/echarts/echarts.min.js`), "vditorEchartsScript").then(() => {
            echarts.init(liandi.graph.element).setOption({
                    title: {
                        text: 'Graph 简单示例'
                    },
                    tooltip: {},
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: 'quinticInOut',
                    series: [
                        {
                            type: 'graph',
                            layout: 'none',
                            symbolSize: 50,
                            roam: true,
                            label: {
                                show: true
                            },
                            edgeSymbol: ['circle', 'arrow'],
                            edgeSymbolSize: [4, 10],
                            edgeLabel: {
                                fontSize: 20
                            },
                            data: data.data,
                            links: data.links,
                            lineStyle: {
                                opacity: 0.9,
                                width: 2,
                                curveness: 0
                            }
                        }
                    ]
                }
            );
        });
    }
}
