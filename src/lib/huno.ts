import chalk from 'chalk'

import { Path } from './path'
import { Cacher } from './cacher'
import { Partials } from './partials'
import { Reader } from './reader'
import { Assembler } from './assembler'
import { Renderer } from './renderer'
import { Generator } from './generator'
import { Server } from './server'
import { Plugins } from './plugins'
import {
  BaseVars,
  ContentVariables,
  HunoOptions,
  SinglePageVars,
} from '../types'

export class Huno {
  private _env: string = ''

  private _config: Path | null = null
  private _cacher: Cacher | null = null
  private _plugins: Plugins | null = null
  private _coreConfig: any

  public options: HunoOptions = {
    noCache: false,
    noPlugins: false,
  }
  public baseVariables: BaseVars
  public contentVariablesList: ContentVariables[] = []
  public pageVariablesList: { [key: string]: SinglePageVars } = {}
  public pageArticleList: { [key: string]: string } = {}

  constructor(env: string, options?: HunoOptions) {
    this._env = env
    if (options) this.options = options
    this._config = new Path(this._env)
    this._cacher = new Cacher(this._env, this.options.noCache)
    this._plugins = new Plugins(this._config)
    this._coreConfig = this._config.coreConfig
    this.baseVariables = this._config.baseVars
    this.init(env)
  }

  private init(env: string) {}

  public async build() {
    if (this._plugins) {
      this._plugins.loadPlugins()
    }
    if (!this._config || !this._cacher) return
    this._cacher.checkOutputExists(this._config.outputPath)
    this._cacher.updateCoreConfig(this._coreConfig)
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
