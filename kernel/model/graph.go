// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package model

import (
	"math"
	"math/rand"
	"strings"
	"sync"

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/render"
)

var graphLock = &sync.Mutex{}

func TreeGraph(keyword string, url, p string, depth int) (nodes []interface{}, links []interface{}) {
	box := Conf.Box(url)
	if nil == box {
		return
	}

	rebuildLinks()

	tree := box.Tree(p)
	genTreeGraph(keyword, tree, &nodes, &links)
	growGraph(&nodes, depth)
	connectForwardlinks(&links)
	connectBacklinks(&links)
	markLinkedNodes(&nodes, &links)
	collide(&nodes, &links)
	return
}

func Graph(keyword string) (nodes []interface{}, links []interface{}) {
	rebuildLinks()

	for _, tree := range trees {
		genTreeGraph(keyword, tree, &nodes, &links)
	}
	connectForwardlinks(&links)
	connectBacklinks(&links)
	markLinkedNodes(&nodes, &links)
	collide(&nodes, &links)
	return
}

func initNodes(nodes *[]interface{}) {
	mDxMap, mDyMap = map[string]float64{}, map[string]float64{}
	mNodeMap = map[string]map[string]interface{}{}
	centerX := CANVAS_WIDTH * .5
	centerY := CANVAS_HEIGHT * .5
	k = math.Sqrt(CANVAS_WIDTH * CANVAS_HEIGHT / float64(len(*nodes)))
	for i := 0; i < len(*nodes); i++ {
		node := (*nodes)[i].(map[string]interface{})
		mNodeMap[node["name"].(string)] = node
		node["x"] = centerX + 100*(rand.Float64())
		node["y"] = centerY + 100*(rand.Float64())
	}
}

func collide(nodes *[]interface{}, links *[]interface{}) {
	graphLock.Lock()
	defer graphLock.Unlock()

	initNodes(nodes)
	calculateRepulsive(nodes)
	calculateTraction(links)
	updateCoordinates(nodes)
}

var (
	CANVAS_WIDTH, CANVAS_HEIGHT = 1024.0, 1024.0
	mDxMap, mDyMap              map[string]float64
	mNodeMap                    map[string]map[string]interface{}
	k                           float64
)

func calculateRepulsive(nodes *[]interface{}) {
	ejectFactor := 6.0
	var distX, distY, dist float64
	for i := 0; i < len(*nodes); i++ {
		n := (*nodes)[i].(map[string]interface{})
		key := n["name"].(string)
		mDxMap[key] = 0.0
		mDyMap[key] = 0.0
		for j := 0; j < len(*nodes); j++ {
			if j != i {
				m := (*nodes)[j].(map[string]interface{})
				distX = n["x"].(float64) - m["x"].(float64)
				distY = n["y"].(float64) - -m["y"].(float64)
				dist = math.Sqrt(distX*distX + distY*distY)
				if dist < 10 {
					ejectFactor = 5.0
				}
				if dist > 0 && dist < 250 {
					mDxMap[key] = mDxMap[key] + distX/dist*k*k/dist*ejectFactor
					mDyMap[key] = mDyMap[key] + distY/dist*k*k/dist*ejectFactor
				}
			}
		}
	}
}

func calculateTraction(links *[]interface{}) {
	condenseFactor := 3.0
	var startNode, endNode map[string]interface{}
	for e := 0; e < len(*links); e++ {
		l := (*links)[e].(map[string]interface{})
		eStartID := l["source"].(string)
		eEndID := l["target"].(string)
		if nil == mNodeMap[eStartID] {
			continue
		}
		if nil == mNodeMap[eEndID] {
			continue
		}

		startNode = mNodeMap[eStartID]
		endNode = mNodeMap[eEndID]

		var distX, distY, dist float64
		distX = startNode["x"].(float64) - endNode["x"].(float64)
		distY = startNode["y"].(float64) - endNode["y"].(float64)
		dist = math.Sqrt(distX*distX + distY*distY)
		mDxMap[eStartID] = mDxMap[eStartID] - distX*dist/k*condenseFactor
		mDyMap[eStartID] = mDyMap[eStartID] - distY*dist/k*condenseFactor
		mDxMap[eEndID] = mDxMap[eEndID] + distX*dist/k*condenseFactor
		mDyMap[eEndID] = mDyMap[eEndID] + distY*dist/k*condenseFactor
	}
}

func updateCoordinates(nodes *[]interface{}) {
	maxt, maxty := 4.0, 3.0
	for v := 0; v < len(*nodes); v++ {
		node := (*nodes)[v].(map[string]interface{})
		dx := math.Floor(mDxMap[node["name"].(string)])
		dy := math.Floor(mDyMap[node["name"].(string)])

		if dx < -maxt {
			dx = -maxt
		}
		if dx > maxt {
			dx = maxt
		}
		if dy < -maxty {
			dy = -maxty
		}
		if dy > maxty {
			dy = maxty
		}

		x := node["x"].(float64)
		y := node["y"].(float64)
		var xx, yy float64
		if (x+dx) >= CANVAS_WIDTH || (x+dx) <= 0 {
			xx = x - dx
		} else {
			xx = x + dx
		}
		if (y+dy) >= CANVAS_HEIGHT || (y+dy <= 0) {
			yy = y - dy
		} else {
			yy = y + dy
		}

		node["x"] = xx
		node["y"] = yy
	}
}

func growGraph(nodes *[]interface{}, maxDepth int) {
	forwardDepth, backDepth := 0, 0
	growLinkedNodes(nodes, nodes, &forwardDepth, &backDepth, maxDepth)
}

func growLinkedNodes(nodes, all *[]interface{}, forwardDepth, backDepth *int, maxDepth int) {
	if 1 > len(*nodes) {
		return
	}

	forwardGeneration := &[]interface{}{}
	if maxDepth > *forwardDepth {
		for _, ref := range forwardlinks {
			for _, node := range *nodes {
				if node.(map[string]interface{})["name"] == ref.ID {
					if existNodes(all, ref.Def.ID) || existNodes(forwardGeneration, ref.Def.ID) || existNodes(nodes, ref.Def.ID) {
						continue
					}

					def := map[string]interface{}{
						"name":     ref.Def.ID,
						"category": 0,
						"url":      ref.Def.URL,
						"path":     ref.Def.Path,
						"content":  render.SubStr(ref.Def.Content, 32),
						"label":    map[string]interface{}{"show": true},
					}

					*forwardGeneration = append(*forwardGeneration, def)
				}
			}
		}

	}

	backGeneration := &[]interface{}{}
	if maxDepth > *backDepth {
		for _, def := range backlinks {
			for _, node := range *nodes {
				if node.(map[string]interface{})["name"] == def.ID {
					for _, ref := range def.Refs {
						if existNodes(all, ref.ID) || existNodes(backGeneration, ref.ID) || existNodes(nodes, ref.ID) {
							continue
						}

						ref := map[string]interface{}{
							"name":     ref.ID,
							"category": 0,
							"url":      ref.URL,
							"path":     ref.Path,
							"content":  render.SubStr(ref.Content, 32),
							"label":    map[string]interface{}{"show": true},
						}

						*backGeneration = append(*backGeneration, ref)
					}
				}
			}
		}
	}

	generation := &[]interface{}{}
	*generation = append(*generation, *forwardGeneration...)
	*generation = append(*generation, *backGeneration...)
	*forwardDepth++
	*backDepth++
	growLinkedNodes(generation, nodes, forwardDepth, backDepth, maxDepth)
	*nodes = append(*nodes, *generation...)
}

func existNodes(nodes *[]interface{}, id string) bool {
	for _, node := range *nodes {
		if node.(map[string]interface{})["name"] == id {
			return true
		}
	}
	return false
}

func connectForwardlinks(links *[]interface{}) {
	for _, ref := range forwardlinks {
		*links = append(*links, map[string]interface{}{
			"source": ref.ID,
			"target": ref.Def.ID,
			"lineStyle": map[string]interface{}{
				"type": "dotted",
			},
		})
	}
}

func connectBacklinks(links *[]interface{}) {
	for _, def := range backlinks {
		for _, ref := range def.Refs {
			*links = append(*links, map[string]interface{}{
				"source": ref.ID,
				"target": def.ID,
				"lineStyle": map[string]interface{}{
					"type": "dotted",
				},
			})
		}
	}
}

const (
	NodeCategoryBug = 1 // 问题块

	NodeSize = 6 // 节点默认大小
)

func genTreeGraph(keyword string, tree *parse.Tree, nodes *[]interface{}, links *[]interface{}) {
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if nil != n.Parent && ast.NodeDocument != n.Parent.Type {
			// 仅支持根节点的直接子节点
			return ast.WalkContinue
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkStop
		}

		text := renderBlockText(n)
		if "" == text || !strings.Contains(strings.ToLower(text), strings.ToLower(keyword)) {
			return ast.WalkContinue
		}

		text = render.SubStr(text, 32)

		isRoot := ast.NodeDocument == n.Type
		show := true
		if !isRoot {
			show = false
		}

		node := map[string]interface{}{
			"name":     n.ID,
			"category": 0,
			"url":      tree.URL,
			"path":     tree.Path,
			"content":  text,
			"label":    map[string]interface{}{"show": show},
			"emphasis": map[string]interface{}{
				"label": map[string]interface{}{"show": true},
			},
		}
		size := NodeSize
		node["symbolSize"] = size
		node["originalSize"] = size

		checkBadNodes(nodes, node, links)
		*nodes = append(*nodes, node)

		if tree.ID != n.ID {
			// 连接根块和子块
			*links = append(*links, map[string]interface{}{
				"source": tree.ID,
				"target": n.ID,
				"symbol": "none",
				"lineStyle": map[string]interface{}{
					"type":  "solid",
					"color": "#7c828b",
				},
			})
		}

		if ast.NodeList == n.Type {
			return ast.WalkSkipChildren
		}
		return ast.WalkContinue
	})
}

func checkBadNodes(nodes *[]interface{}, node interface{}, links *[]interface{}) {
	currentNode := node.(map[string]interface{})
	for _, n := range *nodes {
		existNode := n.(map[string]interface{})
		if currentNode["name"] == existNode["name"] {
			currentNode["name"] = currentNode["name"].(string) + "-" + gulu.Rand.String(7)
			currentNode["category"] = NodeCategoryBug
			*links = append(*links, map[string]interface{}{
				"source":    existNode["name"],
				"target":    currentNode["name"],
				"symbol":    "none",
				"lineStyle": map[string]interface{}{"type": "dashed"},
			})
		}
	}
}

func markLinkedNodes(nodes *[]interface{}, links *[]interface{}) {
	for _, node := range *nodes {
		n := node.(map[string]interface{})
		for _, link := range *links {
			l := link.(map[string]interface{})
			lineStyle := l["lineStyle"].(map[string]interface{})["type"]
			if (l["target"] == n["name"]) && "dotted" == lineStyle {
				n["label"] = map[string]interface{}{"show": true}
				size := NodeSize
				if s := n["symbolSize"]; nil != s {
					size = s.(int)
				}
				size += 1
				n["symbolSize"] = size
				l["lineStyle"].(map[string]interface{})["color"] = "#d23f31"
			}
		}
	}
}
