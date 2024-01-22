import path from 'path'
import { FrontMatterResult } from 'front-matter'
import { marked } from 'marked'

import { Path } from './path'
import { Partials } from './partials'
import { BaseVars, ContentVariables, SinglePageVars } from '../types'
import chalk from 'chalk'

export class Assembler {
  private _config: Path | null = null
  private _partials: Partials | null = null
  private _markupArgumentsReg = /\$\{([^}]+)\}/g

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

  private getSinglePageArticle(body: string): string {
    try {
      const result = marked.parse(body)
      return result as string
    } catch (error) {
      console.log(chalk.redBright(error))
      process.exit(1)
    }
  }

  public assembleAllPage(
    baseVars: BaseVars,
    contentList: FrontMatterResult<ContentVariables>[],
  ): {
    contentVars: ContentVariables[]
    pageVars: { [key: string]: SinglePageVars }
    pageArticles: { [key: string]: string }
  } {
    if (!this._config || !this._partials) {
      process.exit(1)
    }
    const contentVars: ContentVariables[] = []
    const pageArticles: { [key: string]: string } = {}
    const pageVars: { [key: string]: SinglePageVars } = {}

    contentList.forEach((obj) => {
      const vars = obj.attributes
      const key = path.join(this._config!.outputPath, decodeURI(vars._url))
      contentVars.push(vars)

      pageArticles[key] = this.getSinglePageArticle(obj.body)
      pageVars[key] = {
        ...baseVars,
        _type: 'content',
        _url: vars._url,
        _fm: vars,
      }
    })
    pageVars[this._config!.outputPath] = {
      ...baseVars,
      _type: 'index',
      _url: '/',
      _contentList: contentVars,
    }

    return {
      contentVars,
      pageVars,
      pageArticles,
    }
  }
}
