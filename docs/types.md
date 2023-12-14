# 类型说明

```ts
// 基于commander声明huno单条命令的配置
export interface SingleCommand {
  command: string // 命令名称
  description: string // 命令描述
  action: (params?: any) => void | Promise<void> // 命令执行的函数
  options?: string[][] // 命令选项
  arguments?: string[][] // 命令参数
}
```

```ts
// huno应用的核心配置项
export interface CoreConfig {
  port: number // 
  previewPort?: number
  contentDir: string
  outputDir: string
  templateDir: string
  publicDir: string
  templateName: string
  outputCategoryDir: string
}
```
