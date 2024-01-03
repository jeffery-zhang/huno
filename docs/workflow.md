# Huno 工作流程:

## build:

配置解析:

1. Config 配置项解析, 包含 baseVars 基本变量对象
2. Path 绝对路径解析
3. Partials 自定义模板片段, 在渲染阶段使用 nunjucks 根据 baseVars 来渲染出实际的 html 字符串

内容解析:

1. Reader 读取各内容 md 生成内容变量对象列表, 根据文件 mtimeMs 排序
2. Compiler 使用 marked 解析 md 内容转为 html 并插入页面变量对象
3. Parser 生成各页面对象变量, 通过 id 来标识对应页面的变量对象
4. Parser 阶段接入 Plugins, 修改生成的各页面变量对象

页面渲染:

1. Renderer 根据 Parser 生成的页面变量对象列表渲染每个页面对应的 html 字符串, 通过 id 关联
