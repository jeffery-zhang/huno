import chalk from 'chalk'
import nunjucks from 'nunjucks'

import { Path } from './path'
import { SinglePageVars } from '../types'

export class Renderer {
  private _config: Path | null = null

  constructor(config: Path) {
    if (!config) return
    this._config = config
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

  public renderSingleCompiledArticleBeforeInsert(
    key: string,
    vars: SinglePageVars,
    article: string,
  ): string {
    try {
      const renderedArticle = nunjucks.renderString(article, vars)
      return renderedArticle
    } catch (error) {
      console.error(chalk.redBright(`Render ${key} article error\n${error}`))
      process.exit(1)
    }
  }

  public renderAllPage(pageVariablesList: { [key: string]: SinglePageVars }): {
    [key: string]: string
  } {
    if (!this._config) {
      process.exit(1)
    }
    const result: { [key: string]: string } = {}

    Object.keys(pageVariablesList).forEach((key) => {
      const vars = pageVariablesList[key]
      const html = this.renderSinglePageByVars(key, vars)
      result[key] = html
    })

    return result
  }
}
