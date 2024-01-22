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
export interface SinglePageVars {
  _type: 'index' | 'content'
  _url: string // 页面对应url, 必传
  fm?: ContentVariables
  [key: string]: any
}

// 文章拓展参数
export interface ContentVariables {
  title: string
  draft?: boolean
  [key: string]: any
}

export type HunoPlugin = (
  ctx: Huno,
  options: any,
) => {
  init: () => void
}
