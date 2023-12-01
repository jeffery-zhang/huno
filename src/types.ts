export interface SingleCommand {
  command: string
  description: string
  action: (params?: any) => void | Promise<void>
  options?: string[][]
}

export interface ModuleParams {
  provider?: (new (...args: any[]) => any)[]
  params?: any[][]
  consumer?: (new (...args: any[]) => any)[]
}
