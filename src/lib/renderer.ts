import chalk from 'chalk'
import nunjucks from 'nunjucks'

import { Path } from './path'
import { Cacher } from './cacher'
import { Partials } from './partials'
import { BaseVars, SinglePageVars } from '../types'

export class Renderer {
  private _config: Path | null = null
  private _cacaher: Cacher | null = null
  private _partials: Partials | null = null

  constructor(config: Path, cacher: Cacher, partials: Partials) {
    if (!config || !cacher) return
    this._config = config
    this._cacaher = cacher
    this._partials = partials
    nunjucks.configure(this._config.templatePath)
  }

  private renderSinglePageByVars(key: string, vars: SinglePageVars): string {
    try {
      const html = nunjucks.render('index.html', vars)
      return html
    } catch (error) {
      console.error(chalk.redBright(`Render ${key} page error\n${error}`))
      process.exit(1)
    }
  }

  private renderSingleHtmlString(vars: SinglePageVars, html: string): string {
    try {
      const renderedString = nunjucks.renderString(html, vars)
      return renderedString
    } catch (error) {
      console.error(chalk.redBright(`Render string error\n${error}`))
      process.exit(1)
    }
  }

  private renderExtends(vars: SinglePageVars): { [key: string]: string } {
    if (!this._partials || this._partials.extendPartialsList.length === 0)
      return {}

    const ext: { [key: string]: string } = {}
    this._partials.extendPartialsList.forEach(({ name, template }) => {
      ext[name] = this.renderSingleHtmlString(vars, template)
    })
    return ext
  }

  public renderAllPage(
    baseVars: BaseVars,
    pageVariablesList: { [key: string]: SinglePageVars },
    pageArticleList: { [key: string]: string },
  ): {
    [key: string]: string
  } {
    if (!this._config || !this._cacaher) {
      process.exit(1)
    }
    const result: { [key: string]: string } = {}

    Object.keys(pageVariablesList).forEach((key) => {
      const vars = pageVariablesList[key]
      const completeVars = {
        ...baseVars,
        ...vars,
      }
      if (this._cacaher!.hasPageChanged(key, vars)) {
        let _article: string = ''
        if (pageArticleList[key]) {
          _article = this.renderSingleHtmlString(
            completeVars,
            pageArticleList[key],
          )
        }
        const _extends = this.renderExtends(completeVars)
        const html = this.renderSinglePageByVars(key, {
          ...completeVars,
          _article,
          _extends,
        })
        result[key] = html
        this._cacaher!.updatePageCache(key, vars)
      }
    })

    return result
  }
}
