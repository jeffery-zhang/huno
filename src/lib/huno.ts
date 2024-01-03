import { Config } from './config'

export class Huno {
  private _env: string

  public config: Config | null = null

  constructor(env: string) {
    this._env = env
    this.init()
  }

  public init() {
    this.config = new Config(this._env)
  }
}
