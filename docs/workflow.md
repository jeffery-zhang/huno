# Huno 工作流程:

## build:

- 配置项解析
- 文件路径解析
- 模板解析
- 读取器(读取各页面文件内容并生成各页面配置项列表)
- 读取页面配置后根据单个页面缓存判断是否进行后续步骤
- 单个 md 内容字符串转化为内容 html 字符串(Compiler)
- 根据单个页面配置生成页面 html 字符串, 并将 Compiler 生成的内容 html 插入页面 html(Renderer)
- 根据单个页面配置和页面 html 生成页面文件(Generator)
- 完成构建后将最新的页面配置写入缓存

## dev:

- 执行 build 流程
- 运行开发 server (Server)
- 运行监听器监听项目内 md 文件内容变化, 延时重新构建
- 重新 build 完成后重启 server

## new:

- 根据 huno 的 starter 中的模板生成新项目

## preview:

- 启动构建好的文件 server 做预览, 不用监听内容变化

## sitemap:

- 为构建好的网站生成 sitemap.xml
