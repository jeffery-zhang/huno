import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Template } from './template'
import { SinglePageParams, SinglePageConfig, ParsedPageConfig } from '../types'

export class Reader extends Template {
  constructor(env: string) {
    super(env)
  }

  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s

  private filePathToUrl(filePath: string): string {
    return filePath
      .replace(/\\/g, '/')
      .replace('.md', '')
      .split('/')
      .map((url) => encodeURI(url))
      .join('/')
  }

  private extractContentConfig(content: string): SinglePageParams {
    const contentConfig: { [key: string]: string } = {}
    const reg = this._contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      const lines = match[1].trim().split('\n')
      lines.forEach((line) => {
        const [key, value]: string[] = line.split('=')
        contentConfig[key] = value?.trim() ?? ''
      })
      return contentConfig as SinglePageParams
    } else return {}
  }

  private extractContentWithoutConfig(content: string): string {
    const reg = this._contentConfigRegexp
    return content.replace(reg, '').trim()
  }

  private findAllContentMds(): string[] {
    return globSync(`${this.contentPath}/**/*.md`)
  }

  private readSingleContentAndStats(filePath: string): {
    content: string
    updateTime: string
    createTime: string
  } | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const fileStats = fs.statSync(filePath)
      const updateTime = fileStats.mtime
      const createTime = fileStats.birthtime
      return {
        content,
        updateTime: dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss'),
        createTime: dayjs(createTime).format('YYYY-MM-DD HH:mm:ss'),
      }
    } catch (error) {
      console.error(chalk.redBright(`Read ${filePath} error\n${error}`))
      return null
    }
  }

  get parsedPageConfigList(): ParsedPageConfig[] {
    console.log(chalk.yellowBright('Start parsing content files...'))
    const mds = this.findAllContentMds()
    const parsedPageConfigList: ParsedPageConfig[] = []
    mds.forEach((md) => {
      const absoluteFilePath = path.join(this.rootPath, md)
      const options = this.readSingleContentAndStats(absoluteFilePath)
      if (options) {
        const contentConfig = this.extractContentConfig(options.content)
        if (!contentConfig.title) return
        const content = this.extractContentWithoutConfig(options.content)
        const relativeFilePath = md
        const url = this.filePathToUrl(md)
        const fullSinglePageConfig: SinglePageConfig = {
          ...this.pageParams,
          page: {
            ...contentConfig,
            author: contentConfig.author || 'Anonymous',
            url,
            createTime: contentConfig.createTime || options.createTime,
            updateTime: contentConfig.updateTime || options.updateTime,
          },
        }

        parsedPageConfigList.push({
          config: fullSinglePageConfig,
          url,
          relativeFilePath,
          absoluteFilePath,
          content,
          updateTime: options.updateTime,
        })
      }
    })
    console.log(chalk.greenBright('Parsing content files completed!'))
    return parsedPageConfigList
  }
}
