import { remote } from "electron";

export abstract class Constants {
    public static readonly WEBSOCKET_ADDREDD: string = "ws://127.0.0.1:6806/ws";
    public static readonly WEBDAV_ADDRESS: string = "http://127.0.0.1:6807/webdav";
    public static readonly UPLOAD_ADDRESS: string = "http://127.0.0.1:6806/upload";
    public static readonly UPLOAD_FETCH_ADDRESS: string = "http://127.0.0.1:6806/upload/fetch";
    public static readonly DOUBLE_DELTA: number = 468;

    public static readonly LIANDI_FIND_SHOW: string = "liandi-find-show";
    public static readonly LIANDI_FILE_NEW: string = "liandi-file-new";

    public static readonly LIANDI_WEBSOCKET_PUT: string = "liandi-websocket-put";

    public static readonly LIANDI_CONFIG_THEME: string = "liandi-config-theme";

    public static readonly APP_DIR: string = remote.getGlobal("liandiEditor").appDir

    public static readonly CB_CREATE_INSERT = "cb-create-insert"
    public static readonly CB_GETBLOCK_OPEN = "cb-getblock-open"
    public static readonly CB_GETBLOCK_EMBED = "cb-getblock-embed"
    public static readonly CB_PUT_RELOAD = "cb-put-reload"
    public static readonly CB_MOUNT_HELP = "cb-mount-help"
}
