import {showMessage} from "./message";

export const processMessage =(data:string, reqId:number)=> {
    const response = JSON.parse(data);
    if ("msg" === response.cmd) {
        showMessage(response.msg, response.data.closeTimeout);
        return false;
    }

    // TODO: 每个实例无法同步，后期出并发问题再弄
    // if (response.reqId !== reqId) {
    //     return false;
    // }

    if (response.code !== 0) {
        showMessage(response.msg, 0);
        return false;
    }

    return response;
};
