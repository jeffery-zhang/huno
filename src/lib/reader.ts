import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Template } from './template'
import {
  SingleSiteParams,
  SinglePageFullParams,
  ParsedPageConfig,
  ParsedCategoryConfig,
} from '../types'

export class Reader extends Template {
  constructor(env: string) {
    super(env)
    this.parseAllContent()
  }

  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s
  private _parsedPageConfigList: ParsedPageConfig[] = []
  private _parsedCategoryConfigList: ParsedCategoryConfig[] = []

  private getPageUrlThroughInputFilePath(inputFilePath: string): string {
    return inputFilePath
      .replace(this.rootPath, '')
      .replace(/\\/g, '/')
      .slice(1)
      .replace('.md', '')
      .split('/')
      .map((url) => encodeURI(url))
      .join('/')
  }

  private getOutputFilePath(inputFilePath: string) {
    return inputFilePath
      .replace(this.rootPath, this.outputPath)
      .replace('.md', '')
  }

  private extractContentConfig(content: string): SingleSiteParams | null {
    const contentConfig: { [key: string]: string } = {}
    const reg = this._contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      const lines = match[1].trim().split('\n')
      lines.forEach((line) => {
        const [key, value]: string[] = line.split('=')
        contentConfig[key.trim()] = value?.trim() ?? ''
      })
      return contentConfig as SingleSiteParams
    } else return null
  }

  private extractContentWithoutConfig(content: string): string {
    const reg = this._contentConfigRegexp
    return content.replace(reg, '').trim()
  }

  private findAllContentMds(): string[] {
    return globSync(`${this.contentPath}/**/*.md`)
  }

  private readSingleContentAndStats(inputFilePath: string): {
    page: SingleSiteParams
    outputFilePath: string
    content: string
    lastModified: number
  } | null {
    try {
      const fileStats = fs.statSync(inputFilePath)
      const lastModified = Math.floor(fileStats.mtimeMs)
      const createTime = fileStats.birthtime
      const text = fs.readFileSync(inputFilePath, 'utf-8')
      const contentConfig = this.extractContentConfig(text)
      if (!contentConfig || !contentConfig.title) return null
      const category = contentConfig.category || 'default'
      this.generateCategoryConfigList(category)
      const outputFilePath = this.getOutputFilePath(inputFilePath)
      const url = this.getPageUrlThroughInputFilePath(inputFilePath)
      const content = this.extractContentWithoutConfig(text)

      return {
        page: {
          ...contentConfig,
          author: contentConfig.author || 'Anonymous',
          category,
          url,
          createTime:
            contentConfig.createTime ||
            dayjs(createTime).format('YYYY-MM-DD HH:mm:ss'),
          updateTime:
            contentConfig.updateTime ||
            dayjs(lastModified).format('YYYY-MM-DD HH:mm:ss'),
        },
        outputFilePath,
        content,
        lastModified,
      }
    } catch (error) {
      console.error(chalk.redBright(`Read ${inputFilePath} error\n${error}`))
      return null
    }
  }

  private getCategoryPageUrl(category: string) {
    return `${encodeURI(this.outputCategoryDir)}/${encodeURI(category)}`
  }

  private generateCategoryConfigList(category: string) {
    if (
      category &&
      !this._parsedCategoryConfigList.some((item) => item.category === category)
    ) {
      const outputFilePath = path.join(this.outputCategoryPath, category)
      this._parsedCategoryConfigList.push({
        category,
        outputFilePath,
        url: this.getCategoryPageUrl(category),
      })
    }
  }

  get parsedPageConfigList(): ParsedPageConfig[] {
    return this._parsedPageConfigList.sort(
      ({ lastModified: a }, { lastModified: b }) => b - a,
    )
  }

  get parsedCategoryConfigList(): ParsedCategoryConfig[] {
    return this._parsedCategoryConfigList
  }

  parseSingleFileAndContent(inputFilePath: string): ParsedPageConfig | null {
    const options = this.readSingleContentAndStats(inputFilePath)
    if (options) {
      const singlePageFullParams: SinglePageFullParams = {
        ...this.siteParams,
        page: {
          ...options.page,
        },
      }
      return {
        params: singlePageFullParams,
        category: options.page.category,
        url: options.page.url,
        outputFilePath: options.outputFilePath,
        inputFilePath,
        content: options.content,
        lastModified: options.lastModified,
      }
    } else {
      return null
    }
  }

  parseAllContent() {
    console.log(chalk.yellowBright('Start parsing content files...'))
    const mds = this.findAllContentMds()
    mds.forEach((md) => {
      const inputFilePath = path.join(this.rootPath, md)
      const result = this.parseSingleFileAndContent(inputFilePath)
      if (result) {
        this._parsedPageConfigList.push(result)
      }
    })
    this.categoryList = this._parsedCategoryConfigList
    console.log(chalk.greenBright('Parsing content files completed!'))
  }

  getContentOfCategoryConfigList(category: string): ParsedPageConfig[] {
    return this._parsedPageConfigList.filter(
      (item) => item.category === category,
    )
  }
}
