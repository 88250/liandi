import {i18n} from "../i18n";
import {Model} from "../layout/Model";
import {Tab} from "../layout/Tab";
import {processMessage} from "../util/processMessage";
import {showMessage} from "../util/message";
import * as d3 from "d3";
import {openFile} from "../editor/util";
import {getAllModels} from "../layout/util";
import {bgFade} from "../util/bgFade";
import {escapeHtml} from "../util/escape";
import {Constants} from "../constants";

export class Graph extends Model {
    public inputElement: HTMLInputElement;
    private graphElement: HTMLDivElement;
    private levelInputElement: HTMLInputElement;
    public url: string
    public path: string
    private nodes: any
    private svg: any
    private zoom: any

    constructor(options: {
        tab: Tab
        url?: string
        path?: string
        nodeId?: string
    }) {
        super({
            id: options.tab.id,
            callback() {
                if (options.url) {
                    this.send("treegraph", {
                        k: this.inputElement.value,
                        url: options.url,
                        path: options.path,
                        callback: options.nodeId ? Constants.CB_GRAPH_FOCUS : undefined
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
                        if (data.callback === Constants.CB_GRAPH_FOCUS) {
                            setTimeout(() => {
                                this.hlNode(options.nodeId)
                            }, 100)
                        }
                        break;
                    case "rename":
                        if (this.url && data.data.url === this.url && data.data.oldPath === this.path) {
                            this.path = data.data.newPath
                            this.parent.headElement.querySelector("span").textContent = data.data.newName
                        }
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
        let levelHTML = "";
        if (this.url) {
            levelHTML = `<span class="graph__label">${i18n[window.liandi.config.lang].linkLevel}</span>
    <input value="1" min="0" max="16" type="number" class="input graph__number">`;

        }
        options.tab.panelElement.innerHTML = `<div class="graph__input">
    <input class="input" placeholder="${i18n[window.liandi.config.lang].search}">${levelHTML}
</div>
<div class="fn__flex-1 graph__svg"></div>`;

        this.graphElement = options.tab.panelElement.querySelector(".graph__svg");
        this.inputElement = options.tab.panelElement.querySelector(".input");
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
            this.levelInputElement = options.tab.panelElement.querySelector(".graph__number");
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
        const svgElement = this.graphElement.querySelector("svg");
        if (!svgElement) {
            return;
        }
        const width = this.graphElement.clientWidth;
        const height = this.graphElement.clientHeight;
        svgElement.setAttribute("viewBox", `-${width / 2} , -${height / 2} , ${width}, ${height}`);
        svgElement.setAttribute("style", `width: ${width}px; height:${height}px`);
    }

    public hlNode(id: string) {
        const color = window.liandi.config.theme === "dark" ? "#d1d5da" : "#24292e";
        this.nodes.style("fill", color);
        const hlNode = this.nodes.filter((item: any) => item.id === id);
        hlNode.style("fill", "#f3a92f");
        this.svg.transition().duration(1000).call(
            this.zoom.transform,
            d3.zoomIdentity.scale(3).translate(-hlNode._groups[0][0].__data__.x, -hlNode._groups[0][0].__data__.y)
        );
    }

    public onGraph(data: { nodes: Record<string, unknown>[], links: Record<string, unknown>[], url?: string, path?: string }) {
        if (data.nodes.length === 0) {
            return;
        }
        this.graphElement.innerHTML = "<div class='graph__tip vditor-reset'></div>";
        const color = window.liandi.config.theme === "dark" ? "#d1d5da" : "#24292e";
        const secondColor = window.liandi.config.theme === "dark" ? "#959da5" : "#6a737d";
        const hlColor = "#f3a92f";
        const width = this.graphElement.clientWidth;
        const height = this.graphElement.clientHeight;
        const linksData = data.links.map(d => Object.create(d));
        const nodesData = data.nodes.map(d => Object.create(d));
        const tooltipElement = this.graphElement.firstElementChild;
        const simulation = d3.forceSimulation(nodesData)
            .force("link", d3.forceLink(linksData).id((d) => {
                // @ts-ignore
                return d.id;
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
        };

        const svg = d3.create("svg")
            .attr("viewBox", `-${width / 2} , -${height / 2} , ${width}, ${height}`)
            .attr("style", "width: " + width + "px; height: " + height + "px;");
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "triangle")
            .attr("refX", 12)
            .attr("refY", 3)
            .attr("stroke-opacity", 0.36)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0 0l6 3-6 3 1.5-3z")
            .style("fill", "rgba(210, 63, 49, 0.36)");
        this.svg = svg
        svg.on("click", (item) => {
            node.style("fill", color);
            link.style("stroke", (item) => {
                if (item.ref) {
                    return "#d23f31";
                }
                return secondColor;
            });
        })
        const g = svg.append("g");

        const link = g.append("g")
            .attr("stroke-opacity", 0.36)
            .attr("stroke-width", 0.5)
            .selectAll("line")
            .data(linksData)
            .join("line")
            .attr("stroke", (item) => {
                if (item.ref) {
                    return "#d23f31";
                }
                return secondColor;
            }).attr("marker-end", (item) => {
                if (item.ref) {
                    return "url(#triangle)";
                }
                return "";
            });

        const node = g.append("g")
            .attr("fill", color)
            .selectAll("circle")
            .data(nodesData)
            .join("circle")
            .attr("r", d => d.symbolSize)
            .call(drag(simulation));

        let hlNodeId: string[] = [];
        node.on("mouseover", function (d) {
            hlNodeId = []
            d3.select(this).style("fill", hlColor);
            link.style("stroke", function (item) {
                if (item.target === d.target.__data__ || item.source === d.target.__data__) {
                    hlNodeId.push(item.target.id);
                    hlNodeId.push(item.source.id);
                    return hlColor;
                }
                if (item.ref) {
                    return "#d23f31";
                }
                return secondColor;
            });
            hlNodeId = [...new Set(hlNodeId)];
            node.style("fill", (item) => {
                if (hlNodeId.includes(item.id)) {
                    return hlColor;
                }
                return secondColor;
            });
            tooltipElement.innerHTML = `<div>${d.target.__data__.type === "NodeDocument" ? escapeHtml(d.target.__data__.path.substr(1)) : ""}</div>
<div class="ft__secondary ft__smaller">${d.target.__data__.content}</div>`;
            tooltipElement.setAttribute("style", `display:block;top:${d.offsetY + 20}px;left: ${d.offsetX - 15}px`);
        }).on("mouseout", () => {
            node.style("fill", (item) => {
                if (hlNodeId.includes(item.id)) {
                    return hlColor;
                }
                return color;
            });
            tooltipElement.setAttribute("style", "display:none");
        }).on("dblclick", (item) => {
            svg.transition().duration(1000).call(
                zoom.transform,
                d3.zoomIdentity.scale(3).translate(-item.target.__data__.x, -item.target.__data__.y)
            );
            openFile(item.target.__data__.url, item.target.__data__.path, item.target.__data__.type === "NodeDocument" ? undefined : item.target.__data__.id);
        }).on("click", (clickItem) => {
            node.attr("r", (d) => {
                return d.symbolSize;
            });
            getAllModels().editor.find((item) => {
                if (item.url === clickItem.target.__data__.url && item.path === clickItem.target.__data__.path &&
                    !item.element.classList.contains("fn__none")) {
                    const vditorElement = item.vditore.vditor.ir.element;
                    const nodeElement = vditorElement.querySelector(`[data-node-id="${clickItem.target.__data__.id}"]`) as HTMLElement;
                    if (nodeElement && nodeElement.getClientRects().length > 0) {
                        bgFade(nodeElement);
                        vditorElement.scrollTop = nodeElement.offsetTop - vditorElement.clientHeight / 2;
                        d3.select(clickItem.target).attr("r", clickItem.target.__data__.symbolSize * 3);
                        setTimeout(() => {
                            d3.select(clickItem.target).attr("r", clickItem.target.__data__.symbolSize);
                        }, 2000);
                    }
                    return true;
                }
            });
            clickItem.stopPropagation();
        });
        this.nodes = node;

        const zoom = d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on("zoom", (event: any) => {
                g.attr("transform", `translate(${event.transform.x}, ${event.transform.y})` + "scale(" + event.transform.k + ")");
            })
        svg.call(zoom).on("dblclick.zoom", null);
        this.zoom = zoom

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
        this.graphElement.append(svg.node());
    }
}
