import { Path } from './path'
import { Partials } from './partials'
import { Reader } from './reader'
import { SinglePageVars } from '../types'
import { Assembler } from './assembler'

export class Huno {
  private _env: string = ''

  private _config: Path | null = null
  private _partials: Partials | null = null
  private _reader: Reader | null = null
  private _assembler: Assembler | null = null
  private _pageVars: { [key: string]: SinglePageVars } = {}

  constructor() {
    this.init()
  }

  private init() {}

  public async build(env: string) {
    this._env = env
    this._config = new Path(this._env)
    this._partials = new Partials(this._config)
    this._reader = new Reader(this._config)
    await this._reader.readFiles()
    this._assembler = new Assembler(this._config, this._partials)
    this._assembler.assemblePageVars(this._reader.contentList)
    this._pageVars = this._assembler.pageVars
    console.log(this._partials.extendPartialsList)
  }
}
