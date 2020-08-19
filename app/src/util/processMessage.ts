import {showMessage} from "./message";

export const processMessage =(data:string, reqId:number)=> {
    const response = JSON.parse(data);
    if ("msg" === response.cmd) {
        showMessage(response.msg, response.data.closeTimeout);
        return false;
    }

    if (response.reqId !== reqId) {
        return false;
    }

    if (response.code !== 0) {
        showMessage(response.msg, 0);
        return false;
    }

    return response;
};
