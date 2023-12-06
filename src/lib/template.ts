import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import { Path } from './path'
import { markedRendererFileNames } from '../utils/markedRenderer'

type MarkupTemplateItem = {
  name: string
  template: string
  ignore: boolean
}

export class Template extends Path {
  constructor(env: string) {
    super(env)
    this.getMarkupTemplatesList()
  }

  private _markupTemplateList: MarkupTemplateItem[] = []
  private _markedRendererFileNames = markedRendererFileNames

  private getMarkupTemplatesList() {
    const result: MarkupTemplateItem[] = this._markedRendererFileNames
      .map(
        (name) =>
          ({
            name,
            template: this.getSingleMarkupTemplate(name),
            ignore: !this.getSingleMarkupTemplate(name),
          } as MarkupTemplateItem),
      )
      .filter(({ ignore }) => !ignore)

    this._markupTemplateList = result
  }

  private getSingleMarkupTemplate(name: string): string | null {
    const tplPath = path.join(this.templatePath, 'markup', `${name}.html`)
    const tplExists = fs.existsSync(tplPath)
    return tplExists ? fs.readFileSync(tplPath, 'utf-8') : null
  }

  get basicLayoutTemplate(): string {
    try {
      return fs.readFileSync(
        path.join(this.templatePath, 'basicLayout.html'),
        'utf-8',
      )
    } catch (error) {
      console.error(
        chalk.redBright(
          `BasicLayout of template ${this.templateName} not found!\n${error}`,
        ),
      )
      process.exit(1)
    }
  }

  get listTemplate(): string {
    try {
      return fs.readFileSync(path.join(this.templatePath, 'list.html'), 'utf-8')
    } catch (error) {
      console.error(
        chalk.redBright(
          `List of template ${this.templateName} not found!\n${error}`,
        ),
      )
      process.exit(1)
    }
  }

  get contentTemplate(): string {
    try {
      return fs.readFileSync(
        path.join(this.templatePath, 'article.html'),
        'utf-8',
      )
    } catch (error) {
      console.error(
        chalk.redBright(
          `Content of template ${this.templateName} not found!\n${error}`,
        ),
      )
      process.exit(1)
    }
  }

  get markupTemplateList(): MarkupTemplateItem[] {
    return this._markupTemplateList
  }
}
