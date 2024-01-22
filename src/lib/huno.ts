import { Path } from './path'
import { Partials } from './partials'
import { Reader } from './reader'
import { Assembler } from './assembler'
import { Renderer } from './renderer'
import { Generator } from './generator'
import { Server } from './server'
import { BaseVars, ContentVariables, SinglePageVars } from '../types'

export class Huno {
  private _env: string = ''

  private _config: Path | null = null
  private _partials: Partials | null = null
  private _reader: Reader | null = null
  private _assembler: Assembler | null = null
  private _renderer: Renderer | null = null
  private _generator: Generator | null = null

  public baseVariables: BaseVars
  public contentVariablesList: ContentVariables[] = []
  public pageVariablesList: { [key: string]: SinglePageVars } = {}
  public pageArticleList: { [key: string]: string } = {}

  constructor(env: string) {
    this._env = env
    this._config = new Path(this._env)
    this.baseVariables = this._config.baseVars
    this.init(env)
  }

  private init(env: string) {}

  public async build() {
    if (!this._config) return
    this._partials = new Partials(this._config)
    this._reader = new Reader(this._config)
    this._assembler = new Assembler(this._config, this._partials)
    this._renderer = new Renderer(this._config)
    this._generator = new Generator(this._config)

    const frontMatters = await this._reader.readFiles()
    const { contentVars, pageVars, pageArticles } =
      this._assembler.assembleAllPage(this.baseVariables, frontMatters)

    this.contentVariablesList = contentVars
    this.pageVariablesList = pageVars
    this.pageArticleList = pageArticles

    Object.keys(this.pageArticleList).forEach((key) => {
      const renderedArticle: string =
        this._renderer!.renderSingleCompiledArticleBeforeInsert(
          key,
          this.pageVariablesList[key],
          this.pageArticleList[key],
        )
      this.pageVariablesList[key]._article = renderedArticle
    })
    const pageHtmlList = this._renderer.renderAllPage(this.pageVariablesList)
    await this._generator.generateAllPage(pageHtmlList)
  }

  public preview() {
    const server = new Server(this._config!)

    server.startServer()
  }
}
