import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'
import fm, { FrontMatterResult } from 'front-matter'
import lodash from 'lodash'

import { Path } from './path'
import { ContentVariables } from '../types'

export class Reader {
  private paths: Path | null = null
  private _contentList: FrontMatterResult<ContentVariables>[] = []

  constructor(paths: Path) {
    if (!paths) return
    this.paths = paths
  }

  private getUrlByPathName(globPath: string) {
    const dirname = path.dirname(globPath).replace(this.paths!.contentDir, '')
    const filename = path.basename(globPath).replace('.md', '')
    let url = dirname.replace(/[\\\/]/g, '/') + '/' + filename
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    const encodedUrl = url
      .split('/')
      .map((u) => encodeURI(u))
      .join('/')
    return encodedUrl
  }

  private async readSingleContentFile(
    globPath: string,
  ): Promise<FrontMatterResult<ContentVariables> | null> {
    const filePath = path.join(this.paths!.rootPath, globPath)
    return new Promise((resolve) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (!err) {
          const result = fm<ContentVariables>(data)
          if (result.attributes.title) {
            result.attributes.url = this.getUrlByPathName(globPath)
            resolve(result)
          } else resolve(null)
        } else resolve(null)
      })
    })
  }

  public async readFiles() {
    const promises = []
    const fileGlobPaths = globSync(`${this.paths!.contentPath}/**/*.md`)
    fileGlobPaths.forEach((globPath) => {
      promises.push(
        new Promise(async (resolve) => {
          const result = await this.readSingleContentFile(globPath)

          if (result) {
            this._contentList.push(result)
          }
        }),
      )
    })
  }

  public get contentList() {
    return this._contentList
  }
}
