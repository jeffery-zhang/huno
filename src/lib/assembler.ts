import path from 'path'
import { FrontMatterResult } from 'front-matter'
import { marked } from 'marked'

import { Path } from './path'
import { Partials } from './partials'
import { ContentVariables, SinglePageVars } from '../types'
import chalk from 'chalk'

export class Assembler {
  private _config: Path | null = null
  private _partials: Partials | null = null
  private _markupArgumentsReg = /\$\{([^}]+)\}/g
  private _contentVars: ContentVariables[] = []
  public pageVars: { [key: string]: SinglePageVars } = {}
  public pageArticles: { [key: string]: string } = {}

  constructor(config: Path, partials: Partials) {
    if (!config || !partials) return
    this._config = config
    this._partials = partials
    this.generateMarkedRenderer()
  }

  private generateMarkedRenderer() {
    const extensions = this._partials!.markupPartialsList.map(
      ({ name, template }) => {
        return {
          name,
          renderer: (tokens: any) => {
            return this.compileSingleMarkupTemplate(template, tokens)
          },
        }
      },
    )
    marked.use({
      extensions,
    })
  }

  private compileSingleMarkupTemplate(tpl: string, tokens: any) {
    return tpl.replace(this._markupArgumentsReg, (match, key) => {
      return tokens[key.trim()] ?? ''
    })
  }

  private getPageArticle(key: string, body: string) {
    try {
      const result = marked.parse(body)
      this.pageArticles[key] = result as string
    } catch (error) {
      console.log(chalk.redBright(error))
      process.exit(1)
    }
  }

  public assemblePageVars(contentList: FrontMatterResult<ContentVariables>[]) {
    if (!this._config || !this._partials) return
    const baseVars = this._config!.baseVars

    contentList.forEach((obj) => {
      const vars = obj.attributes
      const key = path.join(this._config!.outputPath, vars.url)
      this.getPageArticle(key, obj.body)
      this._contentVars.push(vars)
      this.pageVars[key] = {
        ...baseVars,
        type: 'content',
        url: vars.url,
        fm: vars,
      }
    })
    this.pageVars[this._config!.outputPath] = {
      ...baseVars,
      type: 'index',
      url: '/',
      contentList: this._contentVars,
    }
  }
}
