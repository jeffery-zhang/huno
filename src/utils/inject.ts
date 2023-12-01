export class Injector {
  constructor() {}

  private readonly providers: Map<string, any> = new Map()
  private readonly consumers: Map<string, any> = new Map()

  public setProvider(key: string, value: any): void {
    if (!this.providers.has(key)) this.providers.set(key, value)
  }
  public getProvider(key: string): any {
    return this.providers.get(key)
  }
  public setInstance(key: string, value: any): void {
    if (!this.consumers.has(key)) this.consumers.set(key, value)
  }
  public getInstance(key: string): any {
    if (this.consumers.has(key)) return this.consumers.get(key)
    return null
  }
  public setValue(key: string, value: any): void {
    if (!this.consumers.has(key)) this.consumers.set(key, value)
  }
}
