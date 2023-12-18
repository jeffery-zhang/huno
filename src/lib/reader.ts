import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Template } from './template'
import {
  PageConfig,
  SinglePageParams,
  ExtractedContentParams,
  ParsedContentPageConfigWithContent,
} from '../types'

export class Reader extends Template {
  constructor(env: string) {
    super(env)
  }

  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s
  private _parsedContentConfigList: ParsedContentPageConfigWithContent[] = []
  private _parsedListPageConfigList: PageConfig[] = []

  private getPageUrlByInputFilePath(inputFilePath: string): string {
    return inputFilePath
      .replace(this.rootPath, '')
      .replace(/\\/g, '/')
      .slice(1)
      .replace('.md', '')
      .split('/')
      .map((url) => encodeURI(url))
      .join('/')
  }

  private getOutputFilePathByInputFilePath(inputFilePath: string) {
    return inputFilePath
      .replace(this.rootPath, this.outputPath)
      .replace('.md', '')
  }

  private extractContentConfig(content: string): ExtractedContentParams | null {
    const contentConfig: { [key: string]: string } = {}
    const reg = this._contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      const lines = match[1].trim().split('\n')
      lines.forEach((line) => {
        const [key, value]: string[] = line.split('=')
        contentConfig[key.trim()] = value?.trim() ?? ''
      })
      if (!contentConfig.title) return null
      return contentConfig as ExtractedContentParams
    } else return null
  }

  private extractContentWithoutConfig(content: string): string {
    const reg = this._contentConfigRegexp
    return content.replace(reg, '').trim()
  }

  private findAllContentMds(): string[] {
    return globSync(`${this.contentPath}/**/*.md`)
  }

  private parseSingleContentPageConfigAndContent(inputFilePath: string) {
    try {
      const fileStats = fs.statSync(inputFilePath)
      const lastModified = Math.floor(fileStats.mtimeMs)
      const createTime = fileStats.birthtime
      const text = fs.readFileSync(inputFilePath, 'utf-8')
      const contentConfig = this.extractContentConfig(text)
      if (!contentConfig) return
      const outputFilePath =
        this.getOutputFilePathByInputFilePath(inputFilePath)
      const url = this.getPageUrlByInputFilePath(inputFilePath)
      const content = this.extractContentWithoutConfig(text)

      this._parsedContentConfigList.push({
        config: {
          params: {
            ...this.siteParams,
            ...contentConfig,
            author: contentConfig.author || 'Anonymous',
            url,
            createTime: contentConfig.createTime || dayjs(createTime).format(),
            updateTime:
              contentConfig.updateTime || dayjs(lastModified).format(),
            type: 'content',
          },
          inputFilePath,
          outputFilePath,
          lastModified,
        },
        content,
      })
    } catch (error) {
      console.error(chalk.redBright(`Read ${inputFilePath} error\n${error}`))
    }
  }

  private getContentPageList(condition?: {
    key: string
    value: string
  }): SinglePageParams[] {
    let contentPageList: SinglePageParams[] = []
    if (condition && condition.key && condition.value) {
      contentPageList = this.parsedContentConfigList
        .map((config) => config.config.params)
        .filter(
          (params) =>
            params[condition.key as keyof SinglePageParams] === condition.value,
        )
    } else {
      contentPageList = this.parsedContentConfigList.map(
        (config) => config.config.params,
      )
    }

    return contentPageList
  }

  private parseCategoryConfigList() {
    const categories = this.siteParams.categories ?? []
    if (categories.length === 0 || !this.outputCategoryPath) return

    categories.forEach((category) => {
      const outputFilePath = path.join(this.outputCategoryPath!, category)
      const list = this.getContentPageList({ key: 'category', value: category })
      const url = this.getPageUrlByInputFilePath(
        path.join(this.rootPath, this.outputCategoryDir!, category),
      )
      this._parsedListPageConfigList.push({
        params: {
          ...this.siteParams,
          url,
          category,
          list,
          type: 'list',
        },
        outputFilePath,
      })
    })
  }

  private parseIndexPageConfig() {
    const list = this.getContentPageList()
    this._parsedListPageConfigList.push({
      params: {
        ...this.siteParams,
        url: '',
        list,
        type: 'index',
      },
      outputFilePath: this.outputPath,
    })
  }

  private parseSearchPageConfig() {
    if (!this.outputSearchPath) return
    this._parsedListPageConfigList.push({
      params: {
        ...this.siteParams,
        url: '',
        list: this.getContentPageList(),
        type: 'search',
      },
      outputFilePath: this.outputSearchPath,
    })
  }

  private async parseAllContentPage() {
    console.log(chalk.yellowBright('Start parsing content files...'))
    const mds = this.findAllContentMds()
    const promises: Promise<boolean>[] = []
    mds.forEach((md) => {
      promises.push(
        new Promise((resolve) => {
          try {
            const inputFilePath = path.join(this.rootPath, md)
            this.parseSingleContentPageConfigAndContent(inputFilePath)
            resolve(true)
          } catch (error) {
            resolve(false)
          }
        }),
      )
    })

    await Promise.all(promises)
    console.log(chalk.greenBright('Parsing content files completed!'))
  }

  get parsedContentConfigList(): ParsedContentPageConfigWithContent[] {
    return this._parsedContentConfigList
  }

  get parsedListPageConfigList(): PageConfig[] {
    return this._parsedListPageConfigList
  }

  public async readFiles() {
    await this.parseAllContentPage()
    this.parseCategoryConfigList()
    this.parseIndexPageConfig()
    this.parseSearchPageConfig()
  }
}
