<p align="center">
<img alt="LianDi" src="https://b3log.org/images/brand/liandi-128.png">
<br>
<em>链滴笔记，连接点滴</em>
<br><br>
<a title="Build Status" target="_blank" href="https://travis-ci.org/88250/liandi"><img src="https://img.shields.io/travis/88250/liandi.svg?style=flat-square"></a>
<a title="Code Size" target="_blank" href="https://github.com/88250/liandi"><img src="https://img.shields.io/github/languages/code-size/88250/liandi.svg?style=flat-square"></a>
<a title="MulanPSL" target="_blank" href="https://github.com/88250/liandi/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MulanPSL-orange.svg?style=flat-square"></a>
<br>
<a title="Releases" target="_blank" href="https://github.com/88250/liandi/releases"><img src="https://img.shields.io/github/release/88250/liandi.svg?style=flat-square"></a>
<a title="Release Date" target="_blank" href="https://github.com/88250/liandi/releases"><img src="https://img.shields.io/github/release-date/88250/liandi.svg?style=flat-square&color=99CCFF"></a>
<a title="Downloads" target="_blank" href="https://github.com/88250/liandi/releases"><img src="https://img.shields.io/github/downloads/88250/liandi/total.svg?style=flat-square&color=blueviolet"></a>
<br>
<a title="GitHub Commits" target="_blank" href="https://github.com/88250/liandi/commits/master"><img src="https://img.shields.io/github/commit-activity/m/88250/liandi.svg?style=flat-square"></a>
<a title="Last Commit" target="_blank" href="https://github.com/88250/liandi/commits/master"><img src="https://img.shields.io/github/last-commit/88250/liandi.svg?style=flat-square&color=FF9900"></a>
<a title="GitHub Pull Requests" target="_blank" href="https://github.com/88250/liandi/pulls"><img src="https://img.shields.io/github/issues-pr-closed/88250/liandi.svg?style=flat-square&color=FF9966"></a>
<a title="Hits" target="_blank" href="https://github.com/88250/hits"><img src="https://hits.b3log.org/88250/liandi.svg"></a>
<br><br>
<a title="GitHub Watchers" target="_blank" href="https://github.com/88250/liandi/watchers"><img src="https://img.shields.io/github/watchers/88250/liandi.svg?label=Watchers&style=social"></a>  
<a title="GitHub Stars" target="_blank" href="https://github.com/88250/liandi/stargazers"><img src="https://img.shields.io/github/stars/88250/liandi.svg?label=Stars&style=social"></a>  
<a title="GitHub Forks" target="_blank" href="https://github.com/88250/liandi/network/members"><img src="https://img.shields.io/github/forks/88250/liandi.svg?label=Forks&style=social"></a>  
<a title="Author GitHub Followers" target="_blank" href="https://github.com/88250"><img src="https://img.shields.io/github/followers/88250.svg?label=Followers&style=social"></a>
</p>

## 💡 简介

链滴笔记是一款开源的桌面端笔记应用，支持 Windows、Mac 和 Linux。

欢迎关注 B3log 开源社区微信公众号 `B3log开源`

![b3logos.png](https://img.hacpai.com/file/2019/10/image-d3c00d78.png)

### ✨  特性

* **为 Markdown 而生** 
  * 支持传统的分屏编辑预览模式
  * 支持类似 Typora 保留标记符的即时渲染模式
  * 支持所见即所得编辑模式
  * 支持数学公式、图表、流程图、甘特图、时序图、五线谱等
  * Markdown 文本格式化
  * 粘贴 HTML 自动转换为 Markdown
  * 配置 Markdown 解析渲染细节参数* 是否启用脚注支持
    * 是否启用 [ToC] 支持
    * 是否需要中西文间自动插入空格
    * 是否进行自动术语修正
    * 中文后跟英文逗号句号等标点是否自动替换为中文对应标点
    * 内联数学公式是否允许起始 $ 后紧跟数字
    * 数学公式引擎切换 MathJax、KaTeX
* WebDAV 挂载远程目录
* Double Shift 快速导航
* 全文搜索
* 明亮、暗黑两套主题
* 标签聚合分类 `TBD`
* 导出静态站点，内置多套主题 `TBD`

## 📸 截图

### 明亮主题

![light.png](https://img.hacpai.com/file/2020/03/light-45584759.png)

### 暗黑主题

![dark.png](https://img.hacpai.com/file/2020/03/dark-3c7a74e6.png)

### Markdown 配置

![markdown.png](https://img.hacpai.com/file/2020/03/markdown-e04fa7ee.png)

### 全文搜索

![search.png](https://img.hacpai.com/file/2020/03/search-7ba8af5f.png)

## 🛠️ 安装

### 安装包

* [GitHub](https://github.com/88250/liandi/releases)
* [码云](https://gitee.com/dl88250/liandi/releases)
* [本地下载](https://liandi.b3log.org/releases)

#### 源码构建

1. 安装 Go、Node 环境
2. 运行项目根目录下的 build 脚本
3. 构建成功后将在 app/build 下生成安装包

如果你要修改源码，请按如下步骤搭建开发环境：

1. 在 kernel 目录下构建内核并启动* Windows：`go build -o kernel.exe && kernel.exe`
   * Mac：`go build -o kernel-darwin && ./kernel-darwin`
   * Linux：`go build -o kernel-linux && ./kernel-linux`
2. 在 app 目录下构建前端 `npm run dev` 并启动主进程 `npm run start`

## 🏗️ 技术架构

![arch.png](https://img.hacpai.com/file/2020/01/链滴笔记架构图-9ec13cd6.png)

* 通过 Electron 实现主进程，启动后拉起 golang 实现的内核进程
* 内核实现 WebSocket 服务端和主进程交互
* 内核实现 WebDAV 服务端和客户端
* 文件存取（包括操作本地文件）通过 WebDAV 客户端进行
* Markdown 文件启动和挂载时加载到内存实现全文搜索
* 通过 Vditor 编辑器实现 Markdown 所见即所得编辑模式

## 📜 文档

* [链滴笔记 - 一款桌面端笔记应用，支持 Windows、Mac 和 Linux](https://hacpai.com/article/1582274499427)
* [链滴笔记路线图](https://hacpai.com/article/1579786655216)

## 🏘️ 社区

* [讨论区](https://hacpai.com/tag/liandi-biji)
* [报告问题](https://github.com/88250/liandi/issues/new)

## 📄 开源协议

链滴笔记使用 [木兰宽松许可证, 第2版](http://license.coscl.org.cn/MulanPSL2) 开源协议。

## 🙏 鸣谢

* [浏览器端的编辑器 Vditor](https://github.com/Vanessa219/vditor)
* [对中文语境优化的 Markdown 引擎 Lute](https://github.com/88250/lute)
* [Go WebDAV 客户端库](https://github.com/88250/gowebdav)
* [Go 常用工具库](https://github.com/88250/gulu)
* [Go Web 框架 Gin](https://github.com/gin-gonic/gin)
* [Go WebSocket 框架 melody](https://github.com/olahol/melody)
* [跨平台桌面应用框架 Electron](https://github.com/electron/electron)
