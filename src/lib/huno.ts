import { Path } from './path'
import { Partials } from './partials'
import { Reader } from './reader'

export class Huno {
  private _env: string = ''

  private config: Path | null = null
  private partials: Partials | null = null
  private reader: Reader | null = null

  constructor() {
    this.init()
  }

  private init() {}

  public async build(env: string) {
    this._env = env
    this.config = new Path(this._env)
    this.partials = new Partials(this.config)
    this.reader = new Reader(this.config)
    await this.reader.readFiles()

    console.log(this.reader.contentList)
  }
}
