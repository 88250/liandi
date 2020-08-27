import {i18n} from "../i18n";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {showMessage} from "../util/message";
import * as d3 from "d3";

export class Graph extends Model {
    public inputElement: HTMLInputElement;
    private graphElement: HTMLDivElement;
    private levelInputElement: HTMLInputElement;
    public url: string
    public path: string
    public nodes: Record<string, unknown>[]
    public links: Record<string, unknown>[]

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

    public resize() {
        if (!this.graphElement.firstElementChild) {
            return
        }
        const width = this.graphElement.clientWidth
        const height = this.graphElement.clientHeight
        this.graphElement.firstElementChild.setAttribute("viewBox", `-${width / 2} , -${height / 2} , ${width}, ${height}`)
        this.graphElement.firstElementChild.setAttribute("style", `width: ${width}px; height:${height}px`)
    }

    public hlNode(id: string) {
        // this.nodes.forEach((item) => {
        //     if (item.name === id) {
        //         item.symbolSize = 30;
        //     } else {
        //         item.symbolSize = item.originalSize;
        //     }
        // });
        // this.onGraph({nodes: this.nodes, links: this.links});
    }

    public onGraph(data: { nodes: Record<string, unknown>[], links: Record<string, unknown>[], url?: string, path?: string }) {
        const color = window.liandi.config.theme === "dark" ? "#d1d5da" : "#24292e";
        const lightColor = window.liandi.config.theme === "dark" ? "#959da5" : "#6a737d";
        const hlColor = "#f3a92f";
        const width = this.graphElement.clientWidth
        const height = this.graphElement.clientHeight
        const linksData = data.links.map(d => Object.create(d));
        const nodesData = data.nodes.map(d => Object.create(d));

        const simulation = d3.forceSimulation(nodesData)
            .force("link", d3.forceLink(linksData).id((d) => {
                // @ts-ignore
                return d.id
            }))
            .force("charge", d3.forceManyBody())
            .force("collision", d3.forceCollide())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("center", d3.forceCenter());
        const drag = (simulation: any) => {
            return d3.drag()
                .on("start", (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event: any, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                });
        }

        const svg = d3.create("svg")
            // @ts-ignore
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", 'width: ' + width + 'px; height: ' + height + 'px;')
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "triangle")
            .attr("refX", 6)
            .attr("refY", 6)
            .attr("markerWidth", 30)
            .attr("markerHeight", 30)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 12 6 0 12 3 6")
            .style("fill", "black");

        const link = svg.append("g")
            .attr("stroke-opacity", 0.36)
            .attr('marker-start', 'url(#triangle)')
            .attr("stroke-width", 1)
            .selectAll("line")
            .data(linksData)
            .join("line")
            .attr("stroke", (item: any) => {
                if (item.ref) {
                    return '#d23f31'
                }
                return lightColor
            });

        const node = svg.append("g")
            .attr("fill", color)
            // .attr("stroke", "#fff")
            // .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesData)
            .join("circle")
            .attr("r", d => d.symbolSize)
            // @ts-ignore
            .call(drag(simulation));

        node.append("title")
            .text(d => d.content);

        node.on('mouseover', function (d) {
            d3.select(this).style('fill', hlColor)
            let hlNodeId: string[] = []
            link.style('stroke', function (item) {
                if (item.target === d.target.__data__ || item.source === d.target.__data__) {
                    hlNodeId.push(item.target.id)
                    hlNodeId.push(item.source.id)
                    return hlColor
                }
                return lightColor;
            })
            hlNodeId = [...new Set(hlNodeId)];
            node.style('fill', (item) => {
                if (hlNodeId.includes(item.id)) {
                    return hlColor
                }
                return lightColor
            })
        }).on('mouseout', function () {
            node.style('fill', color)
        })

        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on("zoom", (event: any, d: any) => {
                node.attr("transform", event.transform);
                link.attr("transform", event.transform);
            }));

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // invalidation.then(() => simulation.stop());
        this.graphElement.append(svg.node())

//         if (!this.chart) {
//             this.chart = echarts.init(this.graphElement);
//             this.chart.on("dblclick", (params: IEchartsFormatter) => {
//                 if (params.dataType === "node") {
//                     openFile(params.data.url, params.data.path, params.data.label.show ? "" : params.name);
//                 }
//             });
//             this.chart.on("click", (params: IEchartsFormatter) => {
//                 if (params.dataType === "node") {
//                     getAllModels().editor.find((item) => {
//                         if (item.url === params.data.url && item.path === params.data.path &&
//                             !item.element.classList.contains("fn__none")) {
//                             const vditorElement = item.vditore.vditor.ir.element;
//                             const nodeElement = vditorElement.querySelector(`[data-node-id="${params.name}"]`) as HTMLElement;
//                             if (nodeElement && nodeElement.getClientRects().length > 0) {
//                                 bgFade(nodeElement);
//                                 vditorElement.scrollTop = nodeElement.offsetTop - vditorElement.clientHeight / 2;
//                                 this.hlNode(params.name);
//                             }
//                             return true;
//                         }
//                     });
//                 }
//             });
//         } else {
//             this.chart.resize();
//         }
//         this.nodes = data.nodes;
//         this.links = data.links;
//         const labelColor = window.liandi.config.theme === "dark" ? "#d1d5da" : "#24292e";
//         const labelLightColor = window.liandi.config.theme === "dark" ? "#959da5" : "#6a737d";
//         this.chart.setOption({
//             legend: {
//                 data: [{
//                     name: i18n[window.liandi.config.lang].rootBlock,
//                     icon: "circle",
//                 }, {
//                     name: i18n[window.liandi.config.lang].normalBlock,
//                     icon: "circle"
//                 }],
//                 top: 20,
//                 right: 20,
//                 orient: "vertical",
//                 textStyle: {
//                     color: labelColor,
//                 },
//                 inactiveColor: labelLightColor,
//             },
//             tooltip: {
//                 textStyle: {
//                     color: "#d1d5da",
//                 },
//                 backgroundColor: "rgba(36, 41, 46, .86)",
//                 padding: [2, 4, 2, 4],
//                 formatter: (params: IEchartsFormatter) => {
//                     if (params.dataType === "edge") {
//                         return `<div style="font-size: 10px;line-height: 12px">${params.data.lineStyle.type === "dotted" ? i18n[window.liandi.config.lang].relativeRelation : i18n[window.liandi.config.lang].parentRelation}</div>`;
//                     } else {
//                         return `<div style="font-size: 12px;line-height: 14px; word-break: break-all;width: 220px;white-space: normal;">${params.data.category === 3 ? "This is a bug block, please go to https://github.com/88250/window.liandi/issues/new for feedback" : escapeHtml(params.data.content)}</div>
// <div style="font-size: 10px;color:#959da5;line-height: 12px">${params.data.name}</div>`;
//                     }
//                 },
//             },
//             series: [
//                 {
//                     categories: [{
//                         name: i18n[window.liandi.config.lang].rootBlock,
//                         itemStyle: {
//                             color: labelColor
//                         },
//                     }, {
//                         name: i18n[window.liandi.config.lang].normalBlock,
//                         itemStyle: {
//                             color: labelLightColor
//                         },
//                     }, {
//                         name: "Bug",
//                         itemStyle: {
//                             color: "#ea4aaa"
//                         },
//                     }],
//                     draggable: false,
//                     label: {
//                         position: "bottom",
//                         color: labelColor,
//                         fontSize: 10,
//                         formatter: (params: IEchartsFormatter) => {
//                             if (params.data.category === 0) {
//                                 return path.posix.basename(params.data.path);
//                             } else {
//                                 return params.data.content.substr(0, 8);
//                             }
//                         },
//                     },
//                     type: "graph",
//                     focusNodeAdjacency: true,
//                     roam: true,
//                     lineStyle: {
//                         color: "source",
//                         curveness: 0,
//                         opacity: 0.28,
//                     },
//                     emphasis: {
//                         lineStyle: {
//                             color: "#f3a92f",
//                             opacity: 0.38,
//                         },
//                         itemStyle: {
//                             color: "#f3a92f",
//                         }
//                     },
//                     edgeSymbol: ["none", "arrow"],
//                     edgeSymbolSize: [0, 8],
//                     data: this.nodes,
//                     links: this.links,
//                 }
//             ]
//         });
    }
}
