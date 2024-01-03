# 模块

## Config 类

huno 运行时的基本配置以及站点的基本变量对象, 及支持解析配置文件来修改配置项

1. 定义内容文档, 模板, 静态资源, 自定义片段等文件目录名称
2. 定义模板名称
3. 定义开发服务器端口和预览服务器端口
4. 定义构建产物输出目录
5. baseVars 基本变量对象

### baseVars

构建产物中的页面基本变量, 通过解析 site.yaml 获取, 标题必填, 其余均为选填, 并且可以添加自定义变量, 会通过 nunjucks 渲染到页面模板中

1. title 站点标题(必填)
2. baseUrl 域名或链接(必填)
3. ...

## Path 类(扩展 Config 类)

根据 Config 中的配置项生成对应各种文件的输入或输出的绝对路径

1. rootPath 项目根路径
2. appPath huno 应用根路径
3. contentPath 内容文档路径
4. publicPath 静态资源路径
5. templatePath 自定义或默认模板路径
6. partialsPath 自定义片段路径
7. outputPath 输出路径

## Partials 类

1. 根据 partialsPath 获取 marked 使用的 markup 模板片段字符串, 默认获取模板中的 markup 目录中的模板片段, 若 partialsPath/markup 中有正确的对应模板片段则进行替换
2. 根据 partialsPath 获取 body 中的拓展模板片段字符串
3. 根据 partialsPath 获取 head 中的拓展模板片段字符串
4. 在 Parser 中将这些片段会通过 nunjucks 根据 baseVar 渲染之后作为 html 字符串列表插入到 baseVar 的变量中,随后再在 Renderer 中渲染到真正的页面 html 上

## Reader 类

解析页面变量配置文件, 读取所有内容 md 文件并提取变量对象列表
