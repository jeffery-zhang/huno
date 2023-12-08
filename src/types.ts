export interface SingleCommand {
  command: string
  description: string
  action: (params?: any) => void | Promise<void>
  options?: string[][]
}

export interface CoreConfig {
  contentDir: string
  outputDir: string
  templateDir: string
  publicDir: string
  templateName: string
  port: number
  outputCategoryDir: string
  pageParams: PageParams
}

export interface PageParams {
  baseUrl: string
  defaultLang: string
  title: string
  description: string
  author: string
  keywords: string[]
  categories: ParsedCategoryConfig[]
  [key: string]: any
}

export interface SinglePageParams {
  url: string
  title?: string
  description?: string
  author?: string
  category: string
  keywords?: string[]
  createTime?: string
  updateTime?: string
  [key: string]: any
}

export interface SinglePageFullParams extends PageParams {
  page?: SinglePageParams
}

export interface ListTemplateParams extends PageParams {
  list: SinglePageParams[]
  category: string
}

export interface SingleCategoryPageParams extends PageParams {
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
