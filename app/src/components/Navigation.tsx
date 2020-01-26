import * as React from "react";

import {remote} from 'electron'
import {homedir} from 'os'
import {Constants} from "../constants";

export class Navigation extends React.Component {
    async chooseFile() {
        const filePath = await remote.dialog.showOpenDialog({
            defaultPath: homedir(),
            properties: ['openDirectory'],
        })

        window.ldWebSocket.send(JSON.stringify({
            "cmd": "opendir",
            "param": {
                "url": Constants.WEBDAV_ADDRESS + "/1111111/",
                "path": filePath.filePaths[0]
            }
        }))
        window.ldWebSocket.onmessage = (evt) => {
            const data = JSON.parse(evt.data)
            if (data.cmd === 'opendir') {
                console.log(data)
            }
        }
    }

    render() {
        return (<div>
            <button onClick={this.chooseFile}>
                选中文件
            </button>
        </div>)
    }
}

