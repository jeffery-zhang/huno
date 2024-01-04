import { Path } from './path'
import { Partials } from './partials'

export class Huno {
  private _env: string = ''

  public config: Path | null = null
  public partials: Partials | null = null

  constructor() {
    this.init()
  }

  private init() {}

  public build(env: string) {
    this._env = env
    this.config = new Path(this._env)
    this.partials = new Partials(this.config)
  }
}
