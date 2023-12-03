export interface SingleCommand {
  command: string
  description: string
  action: (params?: any) => void | Promise<void>
  options?: string[][]
}

export interface IConfig {
  contentDir: string
  outputDir: string
  templateDir: string
  port: number
  PageParams: PageParams
}

export interface PageParams {
  baseUrl: string
  defaultLang: string
  title: string
  description: string
  author: string
}
