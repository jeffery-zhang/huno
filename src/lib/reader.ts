import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import { globSync } from 'glob'
import chalk from 'chalk'
import fm, { FrontMatterResult } from 'front-matter'

import { Path } from './path'
import { ContentVariables } from '../types'
import dayjs from 'dayjs'

export class Reader {
  private _path: Path | null = null
  private _total: number = 0
  private _finished: number = 0
  public contentList: FrontMatterResult<ContentVariables>[] = []

  constructor(paths: Path) {
    if (!paths) return
    this._path = paths
  }

  private getUrlByPathName(globPath: string) {
    const dirname = path.dirname(globPath).replace(this._path!.contentDir, '')
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
    const filePath = path.join(this._path!.rootPath, globPath)
    const mtimeMS = Math.floor(fs.statSync(filePath).mtimeMs)
    return new Promise((resolve) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (!err) {
          const result = fm<ContentVariables>(data)
          if (result.attributes.title) {
            result.attributes.url = this.getUrlByPathName(globPath)
            result.attributes.date = dayjs(mtimeMS).format()
            result.attributes._mtimeMS = mtimeMS
            if (!Reflect.has(result.attributes, 'draft')) {
              result.attributes.draft = false
            }
            resolve(result)
          } else resolve(null)
        } else resolve(null)
      })
    })
  }

  public async readFiles() {
    const promises: Promise<any>[] = []
    const fileGlobPaths = globSync(`${this._path!.contentPath}/**/*.md`)
    this._total = fileGlobPaths.length
    fileGlobPaths.forEach((globPath) => {
      promises.push(
        new Promise(async (resolve) => {
          const result = await this.readSingleContentFile(globPath)

          if (result) {
            this.contentList.push(result)
          }
          resolve(true)
          this._finished++
          process.stdout.write(
            chalk.yellowBright(
              `\rReading content files... --> ${this._finished}/${this._total}`,
            ),
          )
        }),
      )
    })

    await Promise.all(promises)
  }
}
