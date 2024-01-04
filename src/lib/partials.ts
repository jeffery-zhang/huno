import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

import { Path } from './path'
import { markedRendererFileNames } from '../utils/markedRenderer'
import { PartialsTemplateItem } from '../types'

export class Partials {
  private _path: Path | null = null

  public markupPartialsList: PartialsTemplateItem[] = []
  public extendPartialsList: PartialsTemplateItem[] = []

  constructor(paths: Path) {
    this._path = paths
    this.getMarkupPartials()
    this.getExtendPartials()
  }

  private getMarkupPartials() {
    if (!this._path) return
    const customMarkupPath = path.join(this._path.partialsPath, 'markups')
    const templateMarkupPath = path.join(this._path.appPath, 'markups')

    const result: PartialsTemplateItem[] = markedRendererFileNames
      .map((name) => {
        const tpl: string | null = this.getSingleMarkupPartial(
          name,
          templateMarkupPath,
          customMarkupPath,
        )

        return {
          name,
          template: tpl,
        }
      })
      .filter(({ template }) => !template) as PartialsTemplateItem[]

    this.markupPartialsList = result
  }

  private getSingleMarkupPartial(
    name: string,
    tplPath: string,
    customPath: string,
  ): string | null {
    const customMarkupFilePath = path.join(customPath, `${name}.html`)
    const tplMarkupFilePath = path.join(tplPath, `${name}.html`)
    if (fs.existsSync(customMarkupFilePath))
      return fs.readFileSync(customMarkupFilePath, 'utf-8')
    if (fs.existsSync(tplMarkupFilePath))
      return fs.readFileSync(tplMarkupFilePath, 'utf-8')
    return null
  }

  private getExtendPartials() {
    if (!this._path) return
    const customPartialsPath = path.join(this._path.partialsPath, 'extends')
    if (!fs.existsSync(customPartialsPath)) return
    const partialsFiles = globSync(`${customPartialsPath}/*.html`)
    const result: PartialsTemplateItem[] = partialsFiles.map((filePath) => {
      const absolutePath = path.resolve(filePath)
      const tpl = fs.readFileSync(absolutePath, 'utf-8')
      const fileName = path.basename(absolutePath, path.extname(absolutePath))
      return {
        name: fileName,
        template: tpl,
      } as PartialsTemplateItem
    })

    this.extendPartialsList = result
  }
}
