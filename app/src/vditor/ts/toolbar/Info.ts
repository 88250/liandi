import {getEventName} from '../util/compatibility';
import {MenuItem} from './MenuItem';
import {Constants} from "../constants";

export class Info extends MenuItem {
    constructor(vditor: IVditor, menuItem: IMenuItem) {
        super(vditor, menuItem);
        this.element.children[0].addEventListener(getEventName(), (event) => {
            event.preventDefault();
            vditor.tip.show(`<div style="max-width: 520px; font-size: 14px;line-height: 22px;margin-bottom: 14px;">
<p style="text-align: center;margin: 14px 0">
    <em>下一代的 Markdown 编辑器，为未来而构建</em>
</p>
<div style="display: flex;margin-bottom: 14px;flex-wrap: wrap;align-items: center">
    <img src="https://cdn.jsdelivr.net/npm/vditor/src/assets/images/logo.png" style="margin: 0 auto;height: 68px"/>
    <div>&nbsp;&nbsp;</div>
    <div style="flex: 1;min-width: 250px">
        Vditor 是一款浏览器端的 Markdown 编辑器，支持所见即所得、即时渲染（类似 Typora）和分屏预览模式。
        它使用 TypeScript 实现，支持原生 JavaScript、Vue、React、Angular，提供<a target="_blank" href="https://github.com/88250/liandi">桌面版</a>。
    </div>
</div>
<div style="display: flex;flex-wrap: wrap;">
    <ul style="list-style: none;flex: 1;min-width:148px">
        <li>
        项目地址：<a href="https://vditor.b3log.org" target="_blank">vditor.b3log.org</a>
        </li>
        <li>
        开源协议：MIT
        </li>
    </ul>
    <ul style="list-style: none;margin-right: 18px">
        <li>
        组件版本：Vditor v${Constants.VERSION} / Lute v${Lute.Version}
        </li>
        <li>
        赞助捐赠：<a href="https://hacpai.com/sponsor" target="_blank">https://hacpai.com/sponsor</a>
        </li>
    </ul>
</div>
</div>`, 0);
        });
    }
}
