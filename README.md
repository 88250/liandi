<p align="center">
<img alt="LianDi" src="https://b3log.org/images/brand/liandi-128.png">
<br>
<em>LianDi Note, connect every bits</em>
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

<p align="center">
<a href="https://hacpai.com/article/1582274499427">中文</a>
</p>

## 💡 Introduction

LianDi Note is an open source desktop note application that supports Windows, Mac and Linux.

Welcome to [LianDi Note Official Discussion Area](https://hacpai.com/tag/liandi-biji) to learn more.

## ✨  Features

* **Born for Markdown**
  * Support three editing modes
    * WYSIWYG: It is more friendly to users who are not familiar with Markdown, and you can use it seamlessly if you are familiar with Markdown
    * Instant Rendering: users familiar with Typora should not be unfamiliar, in theory this is the most elegant Markdown editing method
    * Split View: suitable for Markdown editing on large screen
  * Support mathematical formulas, charts, flowcharts, Gantt charts, timing charts, staffs, etc.
  * Markdown text formatting
  * Paste HTML automatically converted to Markdown
  * Configure Markdown to analyze detailed rendering parameters
    * Whether to enable footnote support
    * Whether to enable [ToC] support
    * Do you need to insert spaces between Chinese and Western languages ​​automatically
    * Whether to perform automatic term correction
    * Punctuation such as Chinese followed by English comma period is automatically replaced with Chinese corresponding punctuation
    * Does inline math formula allow starting $ followed by numbers
    * Math formula engine switching MathJax, KaTeX
* WebDAV mount remote directory
* Double Shift quick navigation
* Fulltext search
* Light and dark themes
* Tag aggregation category `TBD`
* Export static site, built-in multiple sets of themes `TBD`

## 📸 Screenshots

### WYSIWYG

*WYSIWYG* mode is more friendly to users who are not familiar with Markdown, and you can use it seamlessly if you are familiar with Markdown.

![vditor-wysiwyg](https://img.hacpai.com/file/2020/03/wysiwyg-94c13d78.gif)

### Instant Rendering

*Instant Rendering* mode should not be unfamiliar to users who are familiar with Typora. In theory, this is the most elegant Markdown editing method.

![vditor-ir](https://img.hacpai.com/file/2020/03/ir-6d784c1f.gif)

### Split View

The traditional *Split View* mode is suitable for Markdown editing on a large screen.

![vditor-sv](https://img.hacpai.com/file/2020/03/sv-776055ce.gif)

### Light theme

![light.png](https://img.hacpai.com/file/2020/03/light-45584759.png)

### Dark theme

![dark.png](https://img.hacpai.com/file/2020/03/dark-3c7a74e6.png)

### Markdown Options

![markdown.png](https://img.hacpai.com/file/2020/03/markdown-e04fa7ee.png)

### Fulltext search

![search.png](https://img.hacpai.com/file/2020/03/search-7ba8af5f.png)

## 🛠️ Setup

### Installation package

* [GitHub](https://github.com/88250/liandi/releases)
* [Gitee](https://gitee.com/dl88250/liandi/releases)
* [Local download](https://liandi.b3log.org/releases)

### Source building

1. Install Go, Node environment
2. Run the build script in the root directory of the project
3. After the build is successful, the installation package will be generated under app / build

If you want to modify the source code, please set up the development environment as follows:

1. Build the kernel under the kernel directory and start 
   * Windows: `go build -o kernel.exe && kernel.exe`
   * Mac: `go build -o kernel-darwin &&. / Kernel-darwin`
   * Linux: `go build -o kernel-linux &&. / Kernel-linux`
2. Build the frontend `npm run dev` in the app directory and start the main process` npm run start`

## 🏗️ Technology Architecture

![arch.png](https://img.hacpai.com/file/2020/01/链滴笔记架构图-9ec13cd6.png)

* Realize the main process through Electron, and pull up the kernel process implemented by golang after startup
* The kernel realizes the interaction between the WebSocket server and the main process
* The kernel implements WebDAV server and client
* File access (including operation of local files) through WebDAV client
* Markdown files are loaded into memory when starting and mounting to achieve full-text search
* Achieve Markdown WYSIWYG editing mode with Vditor editor

## 📜 Documentation

* [LianDi Note - an open source desktop note application that supports Windows, Mac and Linux](https://hacpai.com/article/1582274499427)
* [LianDi Note roadmap](https://hacpai.com/article/1579786655216)

## 🏘️ Community

* [Forum](https://hacpai.com/tag/liandi-biji)
* [Issues](https://github.com/88250/liandi/issues/new/choose)

## 📄 License

LianDi Note uses the [Mulan Permissive Software License，Version 2](http://license.coscl.org.cn/MulanPSL2) open source license.

## 🙏 Acknowledgement

* [Vditor - Browser-side Markdown editor](https://github.com/Vanessa219/vditor)
* [Lute - A structured Markdown engine that supports Go and JavaScript](https://github.com/88250/lute)
* [GoWebDAV - Go WebDAV client lib](https://github.com/88250/gowebdav)
* [Gulu - Go commons utilities](https://github.com/88250/gulu)
* [Gin - Go Web framework](https://github.com/gin-gonic/gin)
* [Melody - Go WebSocket framework](https://github.com/olahol/melody)
* [Electron - Build cross-platform desktop apps with JavaScript, HTML, and CSS](https://github.com/electron/electron)
