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
	"encoding/json"
)

func BuildGraph() (data []interface{}, links []interface{}) {
	nodeIDs := map[string]string{}
	linkIDs := map[string]string{}
	for _, nodeBacklinks := range treeBacklinks {
		for target, refs := range nodeBacklinks {
			for _, sources := range refs {
				for _, source := range sources.RefNodes {
					linkIDs[target.ID] = source.ID
					nodeIDs[target.ID] = ""
					nodeIDs[source.ID] = ""
				}
			}
		}
	}


	for nodeID, _ := range nodeIDs {
		node := map[string]interface{}{
			"name": nodeID,
		}
		data = append(data, node)
	}

	for source, target := range linkIDs {
		link := map[string]interface{}{
			"source": source,
			"target": target,
		}
		links = append(links, link)
	}

	marshal, err := json.Marshal(data)
	if nil != err {
		Logger.Errorf("生成关系图失败：%s", err)
		return
	}
	Logger.Infof(string(marshal))
	marshal, err = json.Marshal(links)
	if nil != err {
		Logger.Errorf("生成关系图失败：%s", err)
		return
	}
	Logger.Infof(string(marshal))
	return
}
