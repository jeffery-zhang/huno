import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Template } from './template'
import { Cache } from './cache'
import { SinglePageParams, SinglePageConfig, ParsedPageConfig } from '../types'

export class Reader extends Template {
  constructor(env: string, cache: Cache) {
    if (!cache) {
      throw new Error('Cache is required in generator')
    }
    super(env)
    this._cache = cache
  }

  private _cache: Cache
  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s

  private filePathToUrl(absoluteFilePath: string): string {
    return absoluteFilePath
      .replace(this.contentPath, '')
      .replace(/\\/g, '/')
      .slice(1)
      .replace('.md', '')
      .split('/')
      .map((url) => encodeURI(url))
      .join('/')
  }

  private getOutputRelativeFilePath(absoluteFilePath: string) {
    return absoluteFilePath
      .replace(this.contentPath, '')
      .slice(1)
      .replace('.md', '')
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

  private readSingleContentAndStats(absoluteFilePath: string): {
    content: string
    lastModified: number
    updateTime: string
    createTime: string
  } | null {
    try {
      const fileStats = fs.statSync(absoluteFilePath)
      const lastModified = Math.floor(fileStats.mtimeMs)
      if (!this._cache.hasChanged(absoluteFilePath, lastModified)) {
        console.log('跳过构建...', lastModified)
        return null
      }
      const createTime = fileStats.birthtime
      const content = fs.readFileSync(absoluteFilePath, 'utf-8')
      return {
        content,
        lastModified,
        updateTime: dayjs(lastModified).format('YYYY-MM-DD HH:mm:ss'),
        createTime: dayjs(createTime).format('YYYY-MM-DD HH:mm:ss'),
      }
    } catch (error) {
      console.error(chalk.redBright(`Read ${absoluteFilePath} error\n${error}`))
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
        const url = this.filePathToUrl(absoluteFilePath)
        const relativeFilePath =
          this.getOutputRelativeFilePath(absoluteFilePath)
        const content = this.extractContentWithoutConfig(options.content)
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
