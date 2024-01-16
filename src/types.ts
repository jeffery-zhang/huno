import { Huno } from './lib/huno'

// 基于commander声明huno单条命令的配置
export interface SingleCommand {
  command: string // 命令名称
  description: string // 命令描述
  action: (params?: any) => void | Promise<void> // 命令执行的函数
  options?: string[][] // 命令选项
  arguments?: string[][] // 命令参数
}

// 页面基本参数
export interface BaseVars {
  baseUrl: string // url的前缀, 必填
  title: string // 站点标题, 必填
  [key: string]: any
}

export interface PartialsTemplateItem {
  name: string
  template: string
}

// 页面拓展参数
export interface SinglePageParams {
  type: 'list' | 'index' | 'content' | 'search'
  url: string // 页面对应url, 必传
  [key: string]: any
}

// 文章拓展参数
export interface ContentVariables {
  title: string // 文章标题, 必传, 否则不渲染
  url: string
  [key: string]: any
}

// 页面配置, 用于生成对应页面
export interface PageConfig {
  params: SinglePageParams
  outputFilePath: string
  inputFilePath?: string // 输入文件的路径
  lastModified?: number // 最后修改时间戳, 根据文件修改时间获取
}

export interface ParsedContentPageConfigWithContent {
  config: PageConfig
  content: string
}

export type HunoPlugin = (
  ctx: Huno,
  options: { [key: string]: any },
) => {
  init: () => void
}
