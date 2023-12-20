import chalk from 'chalk'
import { marked } from 'marked'
import nunjucks from 'nunjucks'

import { Template } from './template'
import { PageConfig } from '../types'

export class Renderer {
  constructor(template: Template) {
    if (!template) {
      throw new Error('Template is required in compiler')
    }
    this._template = template
    nunjucks.configure(this._template.templatePath)
    this.generateMarkedRenderer()
  }

  private _template: Template
  private _markupArgumentsReg = /\${arguments\[(\d+)\]}/g

  private replaceSingleMarkupTemplateArguments(
    tpl: string,
    variables: IArguments,
  ): string {
    const result = tpl.replace(this._markupArgumentsReg, (match, num) => {
      const index = parseInt(num)
      return variables[index]
    })
    return result
  }

  private generateMarkedRenderer() {
    const that = this
    const rendererList = this._template.markupTemplateList.map(
      ({ name, template }) => {
        const rendererFunction = function () {
          const variables = arguments
          return that.replaceSingleMarkupTemplateArguments(template, variables)
        }
        return [name, rendererFunction]
      },
    )
    marked.use({
      renderer: Object.fromEntries(rendererList),
    })
  }

  public compileSinglePageContent(
    content: string,
    inputFilePath?: string,
  ): string | null {
    try {
      const article = marked(content) as string
      return article
    } catch (error) {
      console.error(
        chalk.redBright(
          `Compile ${inputFilePath || 'content'} error\n${error}`,
        ),
      )
      return null
    }
  }

  public renderCompiledArticleBeforeInsert(
    config: PageConfig,
    article: string,
  ) {
    try {
      const renderedArticle = nunjucks.renderString(article, config.params)
      return renderedArticle
    } catch (error) {
      console.error(
        chalk.redBright(
          `Render ${config.inputFilePath || ''} article error\n${error}`,
        ),
      )
      return null
    }
  }

  public renderPageWithPageConfig(config: PageConfig): string | null {
    try {
      const html = nunjucks.render('index.html', config.params)
      return html
    } catch (error) {
      console.error(
        chalk.redBright(`Render ${config.outputFilePath} error\n${error}`),
      )
      return null
    }
  }
}
