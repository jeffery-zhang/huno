import chalk from 'chalk'
import { marked } from 'marked'

import { Template } from './template'
import { ParsedPageConfig, CompiledPageConfig } from '../types'

export class Compiler {
  constructor(template: Template) {
    if (!template) {
      throw new Error('Template is required in compiler')
    }
    this._template = template
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

  compileSinglePageContent(
    config: ParsedPageConfig,
  ): CompiledPageConfig | null {
    try {
      const article = marked(config.content) as string
      return {
        ...config,
        article,
      }
    } catch (error) {
      console.error(
        chalk.redBright(`Compile ${config.absoluteFilePath} error\n${error}`),
      )
      return null
    }
  }
}
