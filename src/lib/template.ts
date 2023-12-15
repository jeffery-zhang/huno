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

  get markupTemplateList(): MarkupTemplateItem[] {
    return this._markupTemplateList
  }
}
