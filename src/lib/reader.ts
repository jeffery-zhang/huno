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
  private _config: Path | null = null
  private _total: number = 0
  private _finished: number = 0

  constructor(config: Path) {
    if (!config) return
    this._config = config
  }

  private getUrlByPathName(globPath: string) {
    const dirname = path.dirname(globPath).replace(this._config!.contentDir, '')
    const filename = path.basename(globPath).replace('.md', '')
    let url = dirname.replace(/[\\\/]/g, '/') + '/' + filename
    if (url.startsWith('/')) {
      url = url.slice(1)
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
    const filePath = path.join(this._config!.rootPath, globPath)
    const mtimeMS = Math.floor(fs.statSync(filePath).mtimeMs)
    return new Promise((resolve) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (!err) {
          const result = fm<ContentVariables>(data)
          if (!Reflect.has(result.attributes, 'draft')) {
            result.attributes.draft = false
          }
          result.attributes._url = this.getUrlByPathName(globPath)
          result.attributes._date = dayjs(mtimeMS).format()
          result.attributes._mtimeMS = mtimeMS
          resolve(result)
        } else resolve(null)
      })
    })
  }

  public async readFiles(): Promise<FrontMatterResult<ContentVariables>[]> {
    const promises: Promise<FrontMatterResult<ContentVariables> | null>[] = []
    const fileGlobPaths = globSync(`${this._config!.contentPath}/**/*.md`)
    this._total = fileGlobPaths.length
    fileGlobPaths.forEach((globPath) => {
      promises.push(
        new Promise<FrontMatterResult<ContentVariables> | null>(
          async (resolve) => {
            const result = await this.readSingleContentFile(globPath)

            if (result) {
              resolve(result)
              this._finished++
              process.stdout.write(
                chalk.yellowBright(
                  `\rReading content files... --> ${this._finished}/${this._total}`,
                ),
              )
            } else resolve(null)
          },
        ),
      )
    })

    const list = (await Promise.all(promises)).filter((i) => i)
    console.log(chalk.greenBright('\nReading content files finished!'))
    return list as FrontMatterResult<ContentVariables>[]
  }
}
