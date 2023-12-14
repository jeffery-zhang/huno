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
  outputCategoryDir: string
  port: number // dev server 端口
  previewPort?: number // preview server 端口, 未定义时为 dev server 端口
  siteParams: SiteParams
}

export interface SiteParams {
  baseUrl: string
  defaultLang: string
  title: string
  description: string
  author: string
  keywords: string
  subjects: string[]
  categories: ParsedCategoryConfig[]
  unsubjectizedName: string
  uncategorizedName: string
  [key: string]: any
}

export interface SingleSiteParams {
  url: string
  title?: string
  description?: string
  author?: string
  category: string
  keywords?: string
  createTime?: string
  updateTime?: string
  [key: string]: any
}

export interface SinglePageFullParams extends SiteParams {
  page?: SingleSiteParams
}

export interface ListTemplateParams extends SiteParams {
  list: SingleSiteParams[]
  category: string
}

export interface SingleCategorySiteParams extends SiteParams {
  category: string
}

export interface ParsedPageConfig {
  params: SinglePageFullParams
  url: string
  outputFilePath: string
  inputFilePath: string
  content: string
  lastModified: number
  category: string
}

export interface ParsedCategoryConfig {
  category: string
  outputFilePath: string
  url: string
}

export interface CompiledPageConfig extends Omit<ParsedPageConfig, 'content'> {
  article: string
}

export interface RenderedIndexPageConfig {
  html: string
}

export interface RenderedSearchPageConfig {
  html: string
}

export interface RenderedCategoryPageConfig extends ParsedCategoryConfig {
  html: string
}

export interface RenderedPageConfig
  extends Omit<ParsedPageConfig, 'content' | 'params'> {
  html: string
}
