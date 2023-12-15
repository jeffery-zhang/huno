// 基于commander声明huno单条命令的配置
export interface SingleCommand {
  command: string // 命令名称
  description: string // 命令描述
  action: (params?: any) => void | Promise<void> // 命令执行的函数
  options?: string[][] // 命令选项
  arguments?: string[][] // 命令参数
}

// huno应用的核心配置项
export interface CoreConfig {
  contentDir: string // 文章存放的目录
  outputDir: string // 输出目录
  publicDir: string // 静态资源目录
  templateDir: string // 模板目录
  templateName: string // 模板名称
  outputSearchDir?: string // 输出搜索页面的目录
  outputCategoryDir?: string // 输出主题页面的目录
  port: number // dev server 端口
  previewPort?: number // preview server 端口, 未定义时为 dev server 端口
}

// 页面基本参数
export interface SiteParams {
  baseUrl: string // url的前缀, 必传
  siteTitle?: string
  description?: string
  author?: string
  keywords?: string
  categories?: string[] // 分类列表
  [key: string]: any
}

// 页面拓展参数
export interface SinglePageParams {
  type: 'list' | 'index' | 'content' | 'search'
  url: string // 页面对应url, 必传
  [key: string]: any
}

// 文章拓展参数
export interface ExtractedContentParams {
  title: string // 文章标题, 必传, 否则不渲染
  [key: string]: any
}

// 页面配置, 用于生成对应页面
export interface PageConfig {
  params: SiteParams & SinglePageParams
  outputFilePath: string
  inputFilePath?: string // 输入文件的路径
  lastModified?: number // 最后修改时间戳, 根据文件修改时间获取
}

export interface ParsedContentPageConfigWithContent {
  config: PageConfig
  content: string
}
