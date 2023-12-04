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
}

export interface SinglePageParams {
  title?: string
  description?: string
  author?: string
  keywords?: string[]
  createTime?: string
  updateTime?: string
}

export interface SinglePageConfig extends PageParams {
  page: SinglePageParams
}

export interface CompiledPageConfig {
  config: SinglePageConfig
  url: string
  filePath: string
  content: string
  updateTime: string
}
