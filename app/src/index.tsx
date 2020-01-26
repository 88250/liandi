import * as React from "react";
import * as ReactDOM from "react-dom";
import "./assets/base.scss"
import {initWebSocket} from "./util/websocket";
import {App} from "./App";

(async () => {
    await initWebSocket()
    ReactDOM.render(
        <App/>,
        document.getElementById("app")
    );
})()
