import { Huno } from './lib/huno'

// 基于commander声明huno单条命令的配置
export interface SingleCommand {
  command: 'build' | 'preview' | 'create' // 命令名称
  description: string // 命令描述
  action: (params?: any) => void | Promise<void> // 命令执行的函数
  options?: string[][] // 命令选项
  arguments?: string[][] // 命令参数
}

// Huno选项
export interface HunoOptions {
  noCache: boolean
  noPlugins: boolean
}

// 页面基本参数
export interface BaseVars {
  baseUrl: string // url的前缀, 必填
  title: string // 站点标题, 必填
  [key: string]: any
}

// 模板片段
export interface PartialsTemplateItem {
  name: string
  template: string
}

// 文章拓展参数
export interface ContentVariables {
  title: string
  draft?: boolean
  [key: string]: any
}

// 页面拓展参数
export interface SinglePageVars {
  _type: 'index' | 'content'
  _url: string // 页面对应url, 必传
  _fm?: ContentVariables
  _contentList?: ContentVariables[]
  [key: string]: any
}

// 插件
export type HunoPlugin = (ctx: Huno) => {
  name: string
  init?: () => void | Promise<void>
}
