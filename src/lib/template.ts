import fs from 'fs'
import path from 'path'

import { Path } from './path'
import { markedRendererFileNames } from '../utils/markedRenderer'
// @ts-ignore
import BasicLayout from '../../template/basicLayout.html'
// @ts-ignore
import ListTemplate from '../../template/list.html'
// @ts-ignore
import ContentTemplate from '../../template/article.html'

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

  private _defaultBasicLayoutTemplate: string = BasicLayout
  private _defaultListTemplate: string = ListTemplate
  private _defaultContentTemplate: string = ContentTemplate
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
    if (this.templateName === 'default' || !this.templateName) {
      const tplPath = path.join(
        this.defaultTemplatePath,
        'markup',
        `${name}.html`,
      )
      const tplExists = fs.existsSync(tplPath)
      return tplExists ? fs.readFileSync(tplPath, 'utf-8') : null
    } else {
      const tplPath = path.join(
        this.customTemplatePath,
        this.templateName,
        'markup',
        `${name}.html`,
      )
      const tplExists = fs.existsSync(tplPath)
      return tplExists ? fs.readFileSync(tplPath, 'utf-8') : null
    }
  }

  get basicLayoutTemplate(): string {
    if (this.templateName === 'default' || !this.templateName) {
      return this._defaultBasicLayoutTemplate
    } else {
      try {
        return fs.readFileSync(
          path.join(
            this.customTemplatePath,
            this.templateName,
            'basicLayout.html',
          ),
          'utf-8',
        )
      } catch (error) {
        throw new Error(
          `BasicLayout of template ${this.templateName} not found!\n${error}`,
        )
      }
    }
  }

  get listTemplate(): string {
    if (this.templateName === 'default' || !this.templateName) {
      return this._defaultListTemplate
    } else {
      try {
        return fs.readFileSync(
          path.join(this.customTemplatePath, this.templateName, 'list.html'),
          'utf-8',
        )
      } catch (error) {
        throw new Error(
          `List of template ${this.templateName} not found!\n${error}`,
        )
      }
    }
  }

  get contentTemplate(): string {
    if (this.templateName === 'default' || !this.templateName) {
      return this._defaultContentTemplate
    } else {
      try {
        return fs.readFileSync(
          path.join(this.customTemplatePath, this.templateName, 'article.html'),
          'utf-8',
        )
      } catch (error) {
        throw new Error(
          `Content of template ${this.templateName} not found!\n${error}`,
        )
      }
    }
  }

  get markupTemplateList(): MarkupTemplateItem[] {
    return this._markupTemplateList
  }
}
