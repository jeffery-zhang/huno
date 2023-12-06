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
  pageParams: PageParams
}

export interface PageParams {
  baseUrl: string
  defaultLang: string
  title: string
  description: string
  author: string
  keywords: string[]
  [key: string]: any
}

export interface SinglePageParams {
  title?: string
  description?: string
  author?: string
  url?: string
  keywords?: string[]
  createTime?: string
  updateTime?: string
  [key: string]: any
}

export interface SinglePageConfig extends PageParams {
  page?: SinglePageParams
}

export interface ParsedPageConfig {
  config: SinglePageConfig
  url: string
  relativeFilePath: string
  absoluteFilePath: string
  content: string
  updateTime?: string
}

export interface ListTemplateParams extends PageParams {
  list: SinglePageParams[]
}

export interface CompiledPageConfig extends Omit<ParsedPageConfig, 'content'> {
  article: string
}

export interface RenderedPageConfig
  extends Omit<ParsedPageConfig, 'content' | 'config'> {
  html: string
}
