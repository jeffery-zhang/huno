# 概念

## 基本概念

### huno

将 md 文件构建静态网页 html 的 nodejs 命令行工具

### command (命令)

huno 命令行中执行的特定命令

### coreConfig (核心配置)

huno 运行时依赖的配置项, 用于决定各类文件或配置的入口和出口, 以及服务运行的端口

### siteParams (网站参数)

huno 在渲染 html 页面时利用 nunjucks 插入到页面中各种参数, 包含必填参数和自定义参数, 可自行编写模板来自定义需要渲染的参数

### 项目模板

huno 基于模板来渲染基本页面, 模板可以直接用 huno 应用内置(templateName: default), 或用户自定义的模板(根据 templateDir 和 templateName 来决定使用的模板)

## 类

### Config

加载配置项

### Path

处理项目或 huno 应用内部各种文件路径

### Template

加载 marked 的 renderer 模板

### Cache

构建时缓存

### Reader

用于读取项目中的内容并生成页面配置项

### Renderer

利用 marked 编译 md 文件内容为 html, 利用 nunjucks 将模板渲染为完整的 html 字符串

### Generator

将页面配置和渲染的 html 字符串写入对应位置的页面文件中
