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
  subjectDir?: string
  categoryDir?: string
  port: number // dev server 端口
  previewPort?: number // preview server 端口, 未定义时为 dev server 端口
}

// 页面基本参数
export interface SiteParams {
  baseUrl: string // url的前缀, 必传
  title?: string
  description?: string
  author?: string
  keywords?: string
  page?: SinglePageParams
  [key: string]: any
}

// 页面拓展参数
export interface SinglePageParams {
  url: string // 页面对应url
  title?: string
  description?: string
  author?: string
  category?: string
  keywords?: string
  createTime?: string
  updateTime?: string
  [key: string]: any
}

// 读取的页面配置
export interface ParsedPageConfig {
  params: SiteParams
  outputFilePath: string
  inputFilePath: string
  lastModified: number
}
