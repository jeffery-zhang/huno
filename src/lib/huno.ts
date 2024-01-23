import { Path } from './path'
import { Cacher } from './cacher'
import { Partials } from './partials'
import { Reader } from './reader'
import { Assembler } from './assembler'
import { Renderer } from './renderer'
import { Generator } from './generator'
import { Server } from './server'
import { BaseVars, ContentVariables, SinglePageVars } from '../types'
import chalk from 'chalk'

export class Huno {
  private _env: string = ''

  private _config: Path | null = null
  private _cacher: Cacher | null = null
  private coreConfig: any

  public baseVariables: BaseVars
  public contentVariablesList: ContentVariables[] = []
  public pageVariablesList: { [key: string]: SinglePageVars } = {}
  public pageArticleList: { [key: string]: string } = {}

  constructor(env: string) {
    this._env = env
    this._config = new Path(this._env)
    this._cacher = new Cacher(this._env)
    this.coreConfig = this._config.coreConfig
    this.baseVariables = this._config.baseVars
    this.init(env)
  }

  private init(env: string) {}

  public async build() {
    if (!this._config || !this._cacher) return
    this._cacher.checkOutputExists(this._config.outputPath)
    this._cacher.updateCoreConfig(this.coreConfig)
    const partials = new Partials(this._config)
    const reader = new Reader(this._config)
    const assembler = new Assembler(this._config, partials)
    const renderer = new Renderer(this._config, this._cacher, partials)
    const generator = new Generator(this._config)

    this._cacher.updateExtends(partials.extendPartialsList)

    const frontMatters = await reader.readFiles()
    const { contentVars, pageVars, pageArticles } =
      assembler.assembleAllPage(frontMatters)

    this.contentVariablesList = contentVars
    this.pageVariablesList = pageVars
    this.pageArticleList = pageArticles

    this._cacher.updateBaseVars(this.baseVariables)

    const pageHtmlList = renderer.renderAllPage(
      this.baseVariables,
      this.pageVariablesList,
      this.pageArticleList,
    )
    if (Object.keys(pageHtmlList).length === 0) {
      console.log(
        chalk.greenBright('Skip rendering and generation with caching'),
      )
      return
    }
    this._cacher.writeCache()
    await generator.generateAllPage(pageHtmlList)
  }

  public preview() {
    const server = new Server(this._config!)

    server.startServer()
  }
}
